import { Multi, StatofuState } from './types';

export function isOneState(o: any): o is StatofuState {
  return o !== null && typeof o === 'object';
}

export function areMultiStates(o: any): o is Multi<StatofuState> {
  return Array.isArray(o) && Boolean(o[0]);
}

export function areSameMultis(a: any[], b: any[]): boolean {
  if (a === b) return true;

  if (a.length !== b.length) return false;

  for (let i = 0, n = a.length; i < n; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}
