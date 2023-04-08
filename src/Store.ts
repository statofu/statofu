import {
  AnyFn,
  IStatofuStore,
  Multi,
  OneOrMulti,
  StatofuAnyChangeListener,
  StatofuClear,
  StatofuOperate,
  StatofuSnapshot,
  StatofuState,
  StatofuStatesChangeListener,
  StatofuSubscribe,
  StatofuUnsubscribe,
} from './types';
import { areMultiStates, areSameMultis, isOneState } from './utils';

export class StatofuStore implements IStatofuStore {
  _mapOfState: Map<StatofuState, StatofuState> = new Map();

  _anyChangeListeners: StatofuAnyChangeListener[] = [];
  _mapOfOneChangeListeners: Map<StatofuState, StatofuStatesChangeListener<StatofuState>[]> =
    new Map();
  _mapOf$multis: Map<StatofuState, Multi<StatofuState>[]> = new Map();
  _mapOfMultiChangeListeners: Map<
    StatofuState[],
    StatofuStatesChangeListener<Multi<StatofuState>>[]
  > = new Map();

  _getOneState = <TState extends StatofuState>($state: TState): TState => {
    const { _mapOfState } = this;
    if (!_mapOfState.has($state)) {
      _mapOfState.set($state, { ...$state });
    }
    return _mapOfState.get($state) as TState;
  };

  _getOneOrMultiStates = <TStates extends OneOrMulti<StatofuState>>($states: TStates): TStates => {
    const { _getOneState } = this;
    if (areMultiStates($states)) {
      return $states.map(_getOneState) as TStates;
    } else if (isOneState($states)) {
      return _getOneState($states) as TStates;
    } else {
      return $states;
    }
  };

  _setOneStateOnly = <TState extends StatofuState>($state: TState, state: TState): TState => {
    const { _mapOfState } = this;
    _mapOfState.set($state, state);
    return state;
  };

  _setOneOrMultiStatesOnly = <TStates extends OneOrMulti<StatofuState>>(
    $states: TStates,
    states: TStates
  ): TStates => {
    const { _setOneStateOnly } = this;
    if (areMultiStates($states) && areMultiStates(states)) {
      for (let i = 0, n = $states.length; i < n; i++) {
        _setOneStateOnly($states[i], states[i]);
      }
    } else if (isOneState($states) && isOneState(states)) {
      _setOneStateOnly($states, states);
    }
    return states;
  };

  _notifyChangeListeners = <TStates extends OneOrMulti<StatofuState>>(
    $states: TStates,
    newStates: TStates,
    oldStates: TStates
  ): void => {
    const {
      _anyChangeListeners,
      _mapOfOneChangeListeners,
      _mapOf$multis,
      _mapOfMultiChangeListeners,
      _getOneState,
    } = this;

    for (const listener of _anyChangeListeners) {
      listener();
    }

    if (areMultiStates($states) && areMultiStates(newStates) && areMultiStates(oldStates)) {
      const visited$multis = new Set<StatofuState[]>();

      for (let i = 0, n = $states.length; i < n; i++) {
        const oneChangeListeners = _mapOfOneChangeListeners.get($states[i]);
        if (!oneChangeListeners) continue;

        for (const listener of oneChangeListeners) {
          listener(newStates[i], oldStates[i]);
        }

        const $multis = _mapOf$multis.get($states[i]);
        if (!$multis) continue;

        for (const $multi of $multis) {
          if (visited$multis.has($multi)) continue;

          visited$multis.add($multi);

          const multiChangeListeners = _mapOfMultiChangeListeners.get($multi);
          if (!multiChangeListeners) continue;

          const newMultiStates = $multi.map(($s) => {
            const i = $states.indexOf($s);
            return i >= 0 ? newStates[i] : _getOneState($s);
          }) as Multi<StatofuState>;
          const oldMultiStates = $multi.map(($s) => {
            const i = $states.indexOf($s);
            return i >= 0 ? oldStates[i] : _getOneState($s);
          }) as Multi<StatofuState>;

          for (const listener of multiChangeListeners) {
            listener(newMultiStates, oldMultiStates);
          }
        }
      }

      visited$multis.clear();
    } else if (isOneState($states) && isOneState(newStates) && isOneState(oldStates)) {
      const oneChangeListener = _mapOfOneChangeListeners.get($states);
      if (!oneChangeListener) return;

      for (const listener of oneChangeListener) {
        listener(newStates, oldStates);
      }

      const $multis = _mapOf$multis.get($states);
      if (!$multis) return;

      for (const $multi of $multis) {
        const multiChangeListener = _mapOfMultiChangeListeners.get($multi);
        if (!multiChangeListener) continue;

        const newMultiStates = $multi.map(($s) => {
          return $s === $states ? newStates : _getOneState($s);
        }) as Multi<StatofuState>;

        const oldMultiStates = $multi.map(($s) => {
          return $s === $states ? oldStates : _getOneState($s);
        }) as Multi<StatofuState>;

        for (const listener of multiChangeListener) {
          listener(newMultiStates, oldMultiStates);
        }
      }
    }
  };

  snapshot: StatofuSnapshot = <TStates extends OneOrMulti<StatofuState>, TFn extends AnyFn>(
    $states: TStates,
    statesGetterOrValueSelector?: TFn,
    ...payloads: any[]
  ): any => {
    const { _getOneOrMultiStates } = this;
    const states = _getOneOrMultiStates($states);
    return statesGetterOrValueSelector ? statesGetterOrValueSelector(states, ...payloads) : states;
  };

  operate: StatofuOperate = <TStates extends OneOrMulti<StatofuState>, TFn extends AnyFn>(
    $states: TStates,
    statesOrStatesGetterOrStatesReducer: TStates | TFn,
    ...payloads: any[]
  ): TStates => {
    const { _getOneOrMultiStates, _setOneOrMultiStatesOnly, _notifyChangeListeners } = this;
    const oldStates = _getOneOrMultiStates($states);
    const newStates = _setOneOrMultiStatesOnly(
      $states,
      typeof statesOrStatesGetterOrStatesReducer === 'function'
        ? statesOrStatesGetterOrStatesReducer(oldStates, ...payloads)
        : statesOrStatesGetterOrStatesReducer
    );
    _notifyChangeListeners($states, newStates, oldStates);
    return newStates;
  };

  subscribe: StatofuSubscribe = <TStates extends OneOrMulti<StatofuState>>(
    $statesOrAnyChangeListener: TStates | StatofuAnyChangeListener,
    statesChangeListener?: StatofuStatesChangeListener<TStates>
  ): (() => void) => {
    const {
      _anyChangeListeners,
      _mapOfOneChangeListeners,
      _mapOf$multis,
      _mapOfMultiChangeListeners,
      unsubscribe,
    } = this;

    if (areMultiStates($statesOrAnyChangeListener) && statesChangeListener) {
      const $states = $statesOrAnyChangeListener;
      const multiChangeListener = statesChangeListener as StatofuStatesChangeListener<
        Multi<StatofuState>
      >;

      for (const $state of $states) {
        const $multis = _mapOf$multis.get($state) ?? [];
        if (!$multis.includes($states)) {
          $multis.push($states);
        }
        _mapOf$multis.set($state, $multis);
      }
      const listeners = _mapOfMultiChangeListeners.get($states) ?? [];
      if (!listeners.includes(multiChangeListener)) {
        listeners.push(multiChangeListener);
      }
      _mapOfMultiChangeListeners.set($states, listeners);

      return () => unsubscribe($states, statesChangeListener);
    } else if (isOneState($statesOrAnyChangeListener) && statesChangeListener) {
      const $state = $statesOrAnyChangeListener;
      const oneChangelistener = statesChangeListener as StatofuStatesChangeListener<StatofuState>;

      const listeners = _mapOfOneChangeListeners.get($state) ?? [];
      if (!listeners.includes(oneChangelistener)) {
        listeners.push(oneChangelistener);
      }
      _mapOfOneChangeListeners.set($state, listeners);

      return () => unsubscribe($state, statesChangeListener);
    } else if (typeof $statesOrAnyChangeListener === 'function') {
      const anyChangeListener = $statesOrAnyChangeListener;
      if (!_anyChangeListeners.includes(anyChangeListener)) {
        _anyChangeListeners.push(anyChangeListener);
      }
      return () => unsubscribe(anyChangeListener);
    }
    return () => {};
  };

  unsubscribe: StatofuUnsubscribe = <TStates extends OneOrMulti<StatofuState>>(
    $statesOrAnyChangeListener?: TStates | StatofuAnyChangeListener,
    statesChangeListener?: StatofuStatesChangeListener<TStates>
  ): void => {
    const {
      _anyChangeListeners,
      _mapOfOneChangeListeners,
      _mapOf$multis,
      _mapOfMultiChangeListeners,
    } = this;
    if (areMultiStates($statesOrAnyChangeListener)) {
      const $states = $statesOrAnyChangeListener;
      for (const $state of $states) {
        const $multis = _mapOf$multis.get($state);
        if ($multis) {
          for (const $multi of $multis) {
            if (!areSameMultis($states, $multi)) continue;

            const multiChangeListeners = _mapOfMultiChangeListeners.get($multi);
            if (multiChangeListeners) {
              if (statesChangeListener) {
                const i = multiChangeListeners.indexOf(
                  statesChangeListener as StatofuStatesChangeListener<Multi<StatofuState>>
                );
                if (i >= 0) {
                  multiChangeListeners.splice(i, 1);
                  if (multiChangeListeners.length >= 0) {
                    _mapOfMultiChangeListeners.set($multi, multiChangeListeners);
                  } else {
                    _mapOfMultiChangeListeners.delete($multi);
                  }
                }
              } else {
                _mapOfMultiChangeListeners.delete($multi);
              }
            }
          }

          const cleaned$multis = $multis.filter(($m) => _mapOfMultiChangeListeners.has($m));
          if (cleaned$multis.length >= 0) {
            _mapOf$multis.set($state, cleaned$multis);
          } else {
            _mapOf$multis.delete($state);
          }
        }
      }
    } else if (isOneState($statesOrAnyChangeListener)) {
      const $state = $statesOrAnyChangeListener;
      const oneChangeListeners = _mapOfOneChangeListeners.get($state);
      if (oneChangeListeners) {
        if (statesChangeListener) {
          const i = oneChangeListeners.indexOf(
            statesChangeListener as StatofuStatesChangeListener<StatofuState>
          );
          if (i >= 0) {
            oneChangeListeners.splice(i, 1);
            if (oneChangeListeners.length >= 0) {
              _mapOfOneChangeListeners.set($state, oneChangeListeners);
            } else {
              _mapOfOneChangeListeners.delete($state);
            }
          }
        } else {
          _mapOfOneChangeListeners.delete($state);
        }
      }
    } else if (typeof $statesOrAnyChangeListener === 'function') {
      const anyChangeListener = $statesOrAnyChangeListener;
      const i = _anyChangeListeners.indexOf(anyChangeListener);
      if (i >= 0) {
        _anyChangeListeners.splice(i, 1);
      }
    } else if ($statesOrAnyChangeListener === undefined) {
      _anyChangeListeners.splice(0, _anyChangeListeners.length);
      _mapOfOneChangeListeners.clear();
      _mapOf$multis.clear();
      _mapOfMultiChangeListeners.clear();
    }
  };

  clear: StatofuClear = (): void => {
    const {
      _mapOfState,
      _anyChangeListeners,
      _mapOfOneChangeListeners,
      _mapOf$multis,
      _mapOfMultiChangeListeners,
    } = this;
    _mapOfState.clear();
    _anyChangeListeners.splice(0, this._anyChangeListeners.length);
    _mapOfOneChangeListeners.clear();
    _mapOf$multis.clear();
    _mapOfMultiChangeListeners.clear();
  };
}
