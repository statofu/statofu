import { StatofuStore } from './Store';
import { IStatofuStore } from './types';

export function createStatofuStore(
  ...args: ConstructorParameters<typeof StatofuStore>
): IStatofuStore {
  return new StatofuStore(...args);
}
