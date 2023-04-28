import type {
  AnyFn,
  Multi,
  OneOrMulti,
  StatofuAnyStateChangeListener,
  StatofuClear,
  StatofuOperate,
  StatofuSnapshot,
  StatofuState,
  StatofuStatesChangeListener,
  StatofuStore,
  StatofuSubscribe,
  StatofuUnsubscribe,
} from './types';
import {
  areSameArrays,
  areValidMultiStates,
  isValidOneState,
  throwErrOfInvalidStates,
} from './utils';

export class StatofuStoreImpl implements StatofuStore {
  _mapOfState: Map<StatofuState, StatofuState> = new Map();

  _anyStateChangeListeners: StatofuAnyStateChangeListener[] = [];
  _mapOfOneStateChangeListeners: Map<StatofuState, StatofuStatesChangeListener<StatofuState>[]> =
    new Map();
  _mapOf$multis: Map<StatofuState, Multi<StatofuState>[]> = new Map();
  _mapOfMultiStateChangeListeners: Map<
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
    if (areValidMultiStates($states)) {
      return $states.map(_getOneState) as TStates;
    } else if (isValidOneState($states)) {
      const $state = $states;
      return _getOneState($state) as TStates;
    } else {
      throwErrOfInvalidStates();
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
    if (areValidMultiStates($states) && areValidMultiStates(states)) {
      for (let i = 0, n = $states.length; i < n; i++) {
        _setOneStateOnly($states[i], states[i]);
      }
    } else if (isValidOneState($states) && isValidOneState(states)) {
      const [$state, state] = [$states, states];
      _setOneStateOnly($state, state);
    } else {
      throwErrOfInvalidStates();
    }
    return states;
  };

  _notifyStatesChangeListeners = <TStates extends OneOrMulti<StatofuState>>(
    $states: TStates,
    newStates: TStates,
    oldStates: TStates
  ): void => {
    const {
      _anyStateChangeListeners,
      _mapOfOneStateChangeListeners,
      _mapOf$multis,
      _mapOfMultiStateChangeListeners,
      _getOneState,
    } = this;

    if (
      areValidMultiStates($states) &&
      areValidMultiStates(newStates) &&
      areValidMultiStates(oldStates)
    ) {
      if (areSameArrays(newStates, oldStates)) return;

      for (const listener of _anyStateChangeListeners) {
        listener(newStates, oldStates);
      }

      const visited$multis = new Set<StatofuState[]>();

      for (let i = 0, n = $states.length; i < n; i++) {
        const oneStateChangeListeners = _mapOfOneStateChangeListeners.get($states[i]);
        if (oneStateChangeListeners) {
          if (newStates[i] !== oldStates[i]) {
            for (const listener of oneStateChangeListeners) {
              listener(newStates[i], oldStates[i]);
            }
          }
        }

        const $multis = _mapOf$multis.get($states[i]);
        if ($multis) {
          for (const $multi of $multis) {
            if (visited$multis.has($multi)) continue;
            visited$multis.add($multi);

            const multiStateChangeListeners = _mapOfMultiStateChangeListeners.get($multi);
            if (multiStateChangeListeners) {
              const newMultiStates = $multi.map(($s) => {
                const j = $states.indexOf($s);
                return j >= 0 ? newStates[j] : _getOneState($s);
              }) as Multi<StatofuState>;
              const oldMultiStates = $multi.map(($s) => {
                const j = $states.indexOf($s);
                return j >= 0 ? oldStates[j] : _getOneState($s);
              }) as Multi<StatofuState>;

              if (!areSameArrays(newMultiStates, oldMultiStates)) {
                for (const listener of multiStateChangeListeners) {
                  listener(newMultiStates, oldMultiStates);
                }
              }
            }
          }
        }
      }

      visited$multis.clear();
    } else if (
      isValidOneState($states) &&
      isValidOneState(newStates) &&
      isValidOneState(oldStates)
    ) {
      const [$state, newState, oldState] = [$states, newStates, oldStates];

      if (newState === oldState) return;

      for (const listener of _anyStateChangeListeners) {
        listener(newState, oldState);
      }

      const oneStateChangeListeners = _mapOfOneStateChangeListeners.get($state);
      if (oneStateChangeListeners) {
        for (const listener of oneStateChangeListeners) {
          listener(newState, oldState);
        }
      }

      const $multis = _mapOf$multis.get($state);
      if ($multis) {
        for (const $multi of $multis) {
          const multiStateChangeListeners = _mapOfMultiStateChangeListeners.get($multi);
          if (multiStateChangeListeners) {
            const newMultiStates = $multi.map(($s) => {
              return $s === $state ? newState : _getOneState($s);
            }) as Multi<StatofuState>;
            const oldMultiStates = $multi.map(($s) => {
              return $s === $state ? oldState : _getOneState($s);
            }) as Multi<StatofuState>;

            for (const listener of multiStateChangeListeners) {
              listener(newMultiStates, oldMultiStates);
            }
          }
        }
      }
    } else {
      throwErrOfInvalidStates();
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
    const { _getOneOrMultiStates, _setOneOrMultiStatesOnly, _notifyStatesChangeListeners } = this;
    const oldStates = _getOneOrMultiStates($states);
    const newStates = _setOneOrMultiStatesOnly(
      $states,
      typeof statesOrStatesGetterOrStatesReducer === 'function'
        ? statesOrStatesGetterOrStatesReducer(oldStates, ...payloads)
        : statesOrStatesGetterOrStatesReducer
    );
    _notifyStatesChangeListeners($states, newStates, oldStates);
    return newStates;
  };

  subscribe: StatofuSubscribe = <TStates extends OneOrMulti<StatofuState>>(
    $statesOrAnyStateChangeListener: TStates | StatofuAnyStateChangeListener,
    statesChangeListener?: StatofuStatesChangeListener<TStates>
  ): (() => void) => {
    const {
      _anyStateChangeListeners,
      _mapOfOneStateChangeListeners,
      _mapOf$multis,
      _mapOfMultiStateChangeListeners,
      unsubscribe,
    } = this;

    if (areValidMultiStates($statesOrAnyStateChangeListener) && statesChangeListener) {
      const $states = $statesOrAnyStateChangeListener;
      const multiStateChangeListener = statesChangeListener as StatofuStatesChangeListener<
        Multi<StatofuState>
      >;

      for (const $state of $states) {
        const $multis = _mapOf$multis.get($state);

        let $multi: Multi<StatofuState> = $states;
        if ($multis) {
          const $found = $multis.find(($multi) => areSameArrays($multi, $states));
          if (!$found) {
            $multis.push($states);
            _mapOf$multis.set($state, $multis);
          } else {
            $multi = $found;
          }
        } else {
          _mapOf$multis.set($state, [$states]);
        }

        const listeners = _mapOfMultiStateChangeListeners.get($multi);
        if (listeners) {
          if (!listeners.includes(multiStateChangeListener)) {
            listeners.push(multiStateChangeListener);
            _mapOfMultiStateChangeListeners.set($states, listeners);
          }
        } else {
          _mapOfMultiStateChangeListeners.set($states, [multiStateChangeListener]);
        }
      }

      return () => unsubscribe($states, statesChangeListener);
    } else if (isValidOneState($statesOrAnyStateChangeListener) && statesChangeListener) {
      const $state = $statesOrAnyStateChangeListener;
      const oneStateChangelistener =
        statesChangeListener as StatofuStatesChangeListener<StatofuState>;

      const listeners = _mapOfOneStateChangeListeners.get($state);
      if (listeners) {
        if (!listeners.includes(oneStateChangelistener)) {
          listeners.push(oneStateChangelistener);
          _mapOfOneStateChangeListeners.set($state, listeners);
        }
      } else {
        _mapOfOneStateChangeListeners.set($state, [oneStateChangelistener]);
      }

      return () => unsubscribe($state, statesChangeListener);
    } else if (typeof $statesOrAnyStateChangeListener === 'function') {
      const anyStateChangeListener = $statesOrAnyStateChangeListener;
      if (!_anyStateChangeListeners.includes(anyStateChangeListener)) {
        _anyStateChangeListeners.push(anyStateChangeListener);
      }
      return () => unsubscribe(anyStateChangeListener);
    } else {
      throwErrOfInvalidStates();
    }
  };

  unsubscribe: StatofuUnsubscribe = <TStates extends OneOrMulti<StatofuState>>(
    $statesOrAnyStateChangeListener?: TStates | StatofuAnyStateChangeListener,
    statesChangeListener?: StatofuStatesChangeListener<TStates>
  ): void => {
    const {
      _anyStateChangeListeners,
      _mapOfOneStateChangeListeners,
      _mapOf$multis,
      _mapOfMultiStateChangeListeners,
    } = this;

    if (areValidMultiStates($statesOrAnyStateChangeListener)) {
      const $states = $statesOrAnyStateChangeListener;
      for (const $state of $states) {
        const $multis = _mapOf$multis.get($state);
        if ($multis) {
          for (const $multi of $multis) {
            if (!areSameArrays($states, $multi)) continue;

            const multiStateChangeListeners = _mapOfMultiStateChangeListeners.get($multi);
            if (multiStateChangeListeners) {
              if (statesChangeListener) {
                const i = multiStateChangeListeners.indexOf(
                  statesChangeListener as StatofuStatesChangeListener<Multi<StatofuState>>
                );
                if (i >= 0) {
                  multiStateChangeListeners.splice(i, 1);
                  if (multiStateChangeListeners.length > 0) {
                    _mapOfMultiStateChangeListeners.set($multi, multiStateChangeListeners);
                  } else {
                    _mapOfMultiStateChangeListeners.delete($multi);
                  }
                }
              } else {
                _mapOfMultiStateChangeListeners.delete($multi);
              }
            }
          }

          const cleaned$multis = $multis.filter(($m) => _mapOfMultiStateChangeListeners.has($m));
          if (cleaned$multis.length > 0) {
            _mapOf$multis.set($state, cleaned$multis);
          } else {
            _mapOf$multis.delete($state);
          }
        }
      }
    } else if (isValidOneState($statesOrAnyStateChangeListener)) {
      const $state = $statesOrAnyStateChangeListener;
      const oneStateChangeListeners = _mapOfOneStateChangeListeners.get($state);
      if (oneStateChangeListeners) {
        if (statesChangeListener) {
          const i = oneStateChangeListeners.indexOf(
            statesChangeListener as StatofuStatesChangeListener<StatofuState>
          );
          if (i >= 0) {
            oneStateChangeListeners.splice(i, 1);
            if (oneStateChangeListeners.length > 0) {
              _mapOfOneStateChangeListeners.set($state, oneStateChangeListeners);
            } else {
              _mapOfOneStateChangeListeners.delete($state);
            }
          }
        } else {
          _mapOfOneStateChangeListeners.delete($state);
        }
      }
    } else if (typeof $statesOrAnyStateChangeListener === 'function') {
      const anyStateChangeListener = $statesOrAnyStateChangeListener;
      const i = _anyStateChangeListeners.indexOf(anyStateChangeListener);
      if (i >= 0) {
        _anyStateChangeListeners.splice(i, 1);
      }
    } else if ($statesOrAnyStateChangeListener === undefined) {
      _anyStateChangeListeners.splice(0, _anyStateChangeListeners.length);
      _mapOfOneStateChangeListeners.clear();
      _mapOf$multis.clear();
      _mapOfMultiStateChangeListeners.clear();
    } else {
      throwErrOfInvalidStates();
    }
  };

  clear: StatofuClear = (): void => {
    const {
      _mapOfState,
      _anyStateChangeListeners,
      _mapOfOneStateChangeListeners,
      _mapOf$multis,
      _mapOfMultiStateChangeListeners,
    } = this;
    _mapOfState.clear();
    _anyStateChangeListeners.splice(0, _anyStateChangeListeners.length);
    _mapOfOneStateChangeListeners.clear();
    _mapOf$multis.clear();
    _mapOfMultiStateChangeListeners.clear();
  };
}
