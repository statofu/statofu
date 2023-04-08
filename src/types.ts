/**
 * A state or a state config in statofu is any object other than an array.
 */
export interface StatofuState extends Object {
  [k: keyof any]: any;
  length?: never;
}

export interface IStatofuStore {
  snapshot: StatofuSnapshot;
  operate: StatofuOperate;
  subscribe: StatofuSubscribe;
  unsubscribe: StatofuUnsubscribe;
  clear: StatofuClear;
}

export interface StatofuSnapshot {
  <TStates extends OneOrMulti<StatofuState>>($states: TStates): TStates;
  <TStates extends OneOrMulti<StatofuState>, TFn extends StatofuStatesGetter<TStates>>(
    $states: TStates,
    statesGetter: TFn
  ): TStates;
  <
    TStates extends OneOrMulti<StatofuState>,
    TPayloads extends [...any[]],
    TFn extends StatofuValueSelector<TStates, TPayloads>
  >(
    $states: TStates,
    valueSelector: TFn,
    ...payloads: TPayloads
  ): ReturnType<TFn>;
}

export interface StatofuOperate {
  <TStates extends OneOrMulti<StatofuState>, TFn extends StatofuStatesGetter<TStates>>(
    $states: TStates,
    statesOrStatesGetter: TStates | TFn
  ): TStates;
  <
    TStates extends OneOrMulti<StatofuState>,
    TPayloads extends [...any[]],
    TFn extends StatofuStatesReducer<TStates, TPayloads>
  >(
    $states: TStates,
    statesReducer: TFn,
    ...payloads: TPayloads
  ): TStates;
}

export interface StatofuSubscribe {
  (anyChangeListener: StatofuAnyChangeListener): () => void;
  <TStates extends OneOrMulti<StatofuState>>(
    $states: TStates,
    statesChangeListener: StatofuStatesChangeListener<TStates>
  ): () => void;
}

export interface StatofuUnsubscribe {
  (): void;
  (anyChangeListener: StatofuAnyChangeListener): void;
  <TStates extends OneOrMulti<StatofuState>>(
    $states: TStates,
    statesChangeListener?: StatofuStatesChangeListener<TStates>
  ): void;
}

export interface StatofuClear {
  (): void;
}

export type StatofuStatesGetter<TStates extends OneOrMulti<StatofuState>> = (
  states: TStates
) => TStates;

export type StatofuValueSelector<
  TStates extends OneOrMulti<StatofuState>,
  TPayloads extends [...any[]]
> = (states: TStates, ...payloads: TPayloads) => any;

export type StatofuStatesReducer<
  TStates extends OneOrMulti<StatofuState>,
  TPayloads extends [...any[]]
> = (states: TStates, ...payloads: TPayloads) => TStates;

export type StatofuAnyChangeListener = () => void;

export type StatofuStatesChangeListener<TStates extends OneOrMulti<StatofuState>> = (
  newStates: TStates,
  oldStates: TStates
) => void;

export type Multi<TState extends StatofuState> = [TState, ...TState[]];

export type OneOrMulti<TState extends StatofuState> = TState | Multi<TState>;

export type AnyFn = (...args: any) => any;
