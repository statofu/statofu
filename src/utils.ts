import type { Multi, StatofuState } from './types';

const { isArray } = Array;

export function isValidOneState(o: any): o is StatofuState {
  return typeof o === 'object' && o !== null && !isArray(o);
}

export function areValidMultiStates(m: any): m is Multi<StatofuState> {
  return (
    isArray(m) &&
    m.length > 0 &&
    m.reduce((acc, o) => acc && isValidOneState(o) && isUniqueInArray(o, m), true)
  );
}

export function isUniqueInArray(o: any, arr: any[]): boolean {
  return arr.filter((x) => x === o).length === 1;
}

export function areSameArrays(a: any[], b: any[]): boolean {
  if (a === b) return true;

  if (a.length !== b.length) return false;

  for (let i = 0, n = a.length; i < n; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

export const ERR_MSG_INVALID_STATES = 'Invalid statofu states';

export function throwErrOfInvalidStates(): never {
  throw new Error(ERR_MSG_INVALID_STATES);
}
