import {
  IStatofuStore,
  OneOrMulti,
  ParametersExcept0,
  StatofuChangeListener,
  StatofuFn,
  StatofuState,
} from './types';
import { arraysEqual } from './utils';

export class StatofuStore implements IStatofuStore {
  mapOfState: Map<StatofuState, StatofuState> = new Map();

  mapOfChangeListenersOnOne: Map<StatofuState, StatofuChangeListener<StatofuState>[]> = new Map();
  mapOf$multis: Map<StatofuState, StatofuState[][]> = new Map();
  mapOfChangeListenersOnMulti: Map<StatofuState[], StatofuChangeListener<StatofuState[]>[]> =
    new Map();

  _getState = <TState extends StatofuState>($state: TState): TState => {
    if (!this.mapOfState.has($state)) {
      this.mapOfState.set($state, { ...$state });
    }
    return this.mapOfState.get($state) as TState;
  };

  _getStatesOnOneOrMulti = <TStates extends OneOrMulti<StatofuState>>(
    $states: TStates
  ): TStates => {
    return Array.isArray($states)
      ? ($states.map(this._getState) as TStates)
      : this._getState($states);
  };

  _setStateOnly = <TState extends StatofuState>($state: TState, state: TState): TState => {
    this.mapOfState.set($state, state);
    return state;
  };

  _setStatesOnlyOnOneOrMulti = <TStates extends OneOrMulti<StatofuState>>(
    $states: TStates,
    states: TStates
  ): TStates => {
    if (Array.isArray($states) && Array.isArray(states)) {
      for (let i = 0, n = $states.length; i < n; i++) {
        this._setStateOnly($states[i], states[i]);
      }
    } else {
      this._setStateOnly($states, states);
    }
    return states;
  };

  _notifyChangeListeners = <TStates extends OneOrMulti<StatofuState>>(
    $states: TStates,
    newStates: TStates,
    oldStates: TStates
  ): void => {
    if (Array.isArray($states) && Array.isArray(newStates) && Array.isArray(oldStates)) {
      const visited$multis = new Set<StatofuState[]>();

      for (let i = 0, n = $states.length; i < n; i++) {
        const listenersOnOne = this.mapOfChangeListenersOnOne.get($states[i]);
        if (!listenersOnOne) continue;

        for (const listener of listenersOnOne) {
          listener(newStates[i], oldStates[i]);
        }

        const $multis = this.mapOf$multis.get($states[i]);
        if (!$multis) continue;

        for (const $multi of $multis) {
          visited$multis.add($multi);

          const listenersOnMulti = this.mapOfChangeListenersOnMulti.get($multi);
          if (!listenersOnMulti) continue;

          const newMultiStates = $multi.map(($s) => {
            const i = $states.indexOf($s);
            return i >= 0 ? newStates[i] : this._getState($s);
          });
          const oldMultiStates = $multi.map(($s) => {
            const i = $states.indexOf($s);
            return i >= 0 ? oldStates[i] : this._getState($s);
          });

          for (const listener of listenersOnMulti) {
            listener(newMultiStates, oldMultiStates);
          }
        }
      }

      visited$multis.clear();
    } else {
      const listenersOnOne = this.mapOfChangeListenersOnOne.get($states);
      if (!listenersOnOne) return;

      for (const listener of listenersOnOne) {
        listener(newStates, oldStates);
      }

      const $multis = this.mapOf$multis.get($states);
      if (!$multis) return;

      for (const $multi of $multis) {
        const listenersOnMulti = this.mapOfChangeListenersOnMulti.get($multi);
        if (!listenersOnMulti) continue;

        const newMultiStates = $multi.map(($s) => {
          return $s === $states ? newStates : this._getState($s);
        });

        const oldMultiStates = $multi.map(($s) => {
          return $s === $states ? oldStates : this._getState($s);
        });

        for (const listener of listenersOnMulti) {
          listener(newMultiStates, oldMultiStates);
        }
      }
    }
  };

  snapshot = <TStates extends OneOrMulti<StatofuState>, TFn extends StatofuFn<TStates>>(
    $states: TStates,
    valueSelector?: TFn
  ): TStates | ReturnType<TFn> => {
    const states = this._getStatesOnOneOrMulti($states);
    return valueSelector ? valueSelector(states) : states;
  };

  operate = <TStates extends OneOrMulti<StatofuState>, TFn extends StatofuFn<TStates, TStates>>(
    $states: TStates,
    statesReducer: TFn,
    ...payloads: ParametersExcept0<TFn>
  ): TStates => {
    const oldStates = this._getStatesOnOneOrMulti($states);
    const newStates = this._setStatesOnlyOnOneOrMulti(
      $states,
      statesReducer(oldStates, ...payloads)
    );
    this._notifyChangeListeners($states, newStates, oldStates);
    return newStates;
  };

  subscribe = <TStates extends OneOrMulti<StatofuState>>(
    $states: TStates,
    changeListener: StatofuChangeListener<TStates>
  ): (() => void) => {
    if (Array.isArray($states)) {
      for (const $state of $states) {
        const $multis = this.mapOf$multis.get($state) ?? [];
        if (!$multis.includes($states)) {
          $multis.push($states);
        }
        this.mapOf$multis.set($state, $multis);
      }
      const listenerOnMulti = changeListener as StatofuChangeListener<StatofuState[]>;
      const listeners = this.mapOfChangeListenersOnMulti.get($states) ?? [];
      if (!listeners.includes(listenerOnMulti)) {
        listeners.push(listenerOnMulti);
      }
      this.mapOfChangeListenersOnMulti.set($states, listeners);
    } else {
      const listenerOnOne = changeListener as StatofuChangeListener<StatofuState>;
      const listeners = this.mapOfChangeListenersOnOne.get($states) ?? [];
      if (listeners.includes(listenerOnOne)) {
        listeners.push(listenerOnOne);
      }
      listeners.push(listenerOnOne);
      this.mapOfChangeListenersOnOne.set($states, listeners);
    }
    return () => this.unsubscribe($states, changeListener);
  };

  unsubscribe = <TStates extends OneOrMulti<StatofuState>>(
    $states: TStates,
    changeListener?: StatofuChangeListener<TStates>
  ): void => {
    if (Array.isArray($states)) {
      for (const $state of $states) {
        const $multis = this.mapOf$multis.get($state);
        if ($multis) {
          for (const $multi of $multis) {
            if (!arraysEqual($states, $multi)) continue;

            const listenersOnMulti = this.mapOfChangeListenersOnMulti.get($multi);
            if (listenersOnMulti) {
              if (changeListener) {
                const i = listenersOnMulti.indexOf(
                  changeListener as StatofuChangeListener<StatofuState[]>
                );
                if (i >= 0) {
                  listenersOnMulti.splice(i, 1);
                  if (listenersOnMulti.length >= 0) {
                    this.mapOfChangeListenersOnMulti.set($multi, listenersOnMulti);
                  } else {
                    this.mapOfChangeListenersOnMulti.delete($multi);
                  }
                }
              } else {
                this.mapOfChangeListenersOnMulti.delete($multi);
              }
            }
          }

          const cleaned$multis = $multis.filter(($m) => this.mapOfChangeListenersOnMulti.has($m));
          if (cleaned$multis.length >= 0) {
            this.mapOf$multis.set($state, cleaned$multis);
          } else {
            this.mapOf$multis.delete($state);
          }
        }
      }
    } else {
      const listenersOnOne = this.mapOfChangeListenersOnOne.get($states);
      if (listenersOnOne) {
        if (changeListener) {
          const i = listenersOnOne.indexOf(changeListener as StatofuChangeListener<StatofuState>);
          if (i >= 0) {
            listenersOnOne.splice(i, 1);
            if (listenersOnOne.length >= 0) {
              this.mapOfChangeListenersOnOne.set($states, listenersOnOne);
            } else {
              this.mapOfChangeListenersOnOne.delete($states);
            }
          }
        } else {
          this.mapOfChangeListenersOnOne.delete($states);
        }
      }
    }
  };

  clear(): void {
    this.mapOfState.clear();
    this.mapOfChangeListenersOnOne.clear();
    this.mapOf$multis.clear();
    this.mapOfChangeListenersOnMulti.clear();
  }
}
