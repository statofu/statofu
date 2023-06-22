export interface StatofuState {
  [k: keyof any]: any;
  length?: never;
}

export interface StatofuStore {
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
  <TStates extends OneOrMulti<StatofuState>, TFn extends StatofuValueSelector<TStates, any>>(
    $states: TStates,
    valueSelector: TFn,
    ...payloads: TFn extends StatofuValueSelector<TStates, [...infer TPayloads]> ? TPayloads : any
  ): ReturnType<TFn>;
}

export interface StatofuOperate {
  <TStates extends OneOrMulti<StatofuState>, TFn extends StatofuStatesGetter<TStates>>(
    $states: TStates,
    statesOrStatesGetter: TStates | TFn
  ): TStates;
  <TStates extends OneOrMulti<StatofuState>, TFn extends StatofuStatesReducer<TStates, any>>(
    $states: TStates,
    statesReducer: TFn,
    ...payloads: TFn extends StatofuStatesReducer<TStates, [...infer TPayloads]> ? TPayloads : any
  ): TStates;
}

export interface StatofuSubscribe {
  (anyStateChangeListener: StatofuAnyStateChangeListener): () => void;
  <TStates extends OneOrMulti<StatofuState>>(
    $states: TStates,
    statesChangeListener: StatofuStatesChangeListener<TStates>
  ): () => void;
}

export interface StatofuUnsubscribe {
  (): void;
  (anyStateChangeListener: StatofuAnyStateChangeListener): void;
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

export type StatofuAnyStateChangeListener = StatofuStatesChangeListener<OneOrMulti<StatofuState>>;

export type StatofuStatesChangeListener<TStates extends OneOrMulti<StatofuState>> = (
  newStates: TStates,
  oldStates: TStates
) => void;

export type Multi<TState extends StatofuState> = [TState, ...TState[]];

export type OneOrMulti<TState extends StatofuState> = TState | Multi<TState>;

export type AnyFn = (...args: any) => any;
