export interface StatofuState {}

export type StatofuFn<TStates extends OneOrMulti<StatofuState>, TValue = any> = (
  states: TStates,
  ...args: any
) => TValue;

export interface IStatofuStore {
  snapshot: StatofuSnapshot;
  operate: StatofuOperate;
  subscribe: StatofuSubscribe;
  unsubscribe: StatofuUnsubscribe;
  clear(): void;
}

export interface StatofuOperate {
  <TStates extends OneOrMulti<StatofuState>, TFn extends StatofuFn<TStates, TStates>>(
    $states: TStates,
    statesReducer: TFn,
    ...payloads: ParametersExcept0<TFn>
  ): TStates;
}

export interface StatofuSnapshot {
  <TStates extends OneOrMulti<StatofuState>>($states: TStates): TStates;
  <TStates extends OneOrMulti<StatofuState>, TFn extends StatofuFn<TStates>>(
    $states: TStates,
    valueSelector: TFn
  ): ReturnType<TFn>;
}

export interface StatofuSubscribe {
  <TStates extends OneOrMulti<StatofuState>>(
    $states: TStates,
    changeListener: StatofuChangeListener<TStates>
  ): () => void;
}

export interface StatofuUnsubscribe {
  <TStates extends OneOrMulti<StatofuState>>($states: TStates): void;
  <TStates extends OneOrMulti<StatofuState>>(
    $states: TStates,
    changeListener: StatofuChangeListener<TStates>
  ): void;
}

export type StatofuChangeListener<TStates extends OneOrMulti<StatofuState>> = (
  newStates: TStates,
  oldStates: TStates
) => void;

export type OneOrMulti<TState extends StatofuState> = TState | TState[];

export type ParametersExcept0<TFn extends (...args: any) => any> = TFn extends (
  arg0: any,
  ...args: infer P
) => any
  ? P
  : never;
