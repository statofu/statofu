import type { StatofuStore } from '..';
import type { StatofuSsrStateFolder } from './types';

export function foldStates<T extends StatofuSsrStateFolder>(store: StatofuStore, form: T): T {
  const stateFolder: T = { ...form };
  for (const [k, $s] of Object.entries(form)) {
    stateFolder[k as keyof T] = store.snapshot($s) as T[keyof T];
  }
  return stateFolder;
}

export function unfoldStates<T extends StatofuSsrStateFolder>(
  store: StatofuStore,
  form: T,
  stateFolder: T
): T {
  for (const [k, $s] of Object.entries(form)) {
    store.operate($s, stateFolder[k]);
  }
  return stateFolder;
}
