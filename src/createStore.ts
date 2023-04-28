import { StatofuStoreImpl } from './StoreImpl';
import type { StatofuStore } from './types';

export function createStatofuStore(
  ...args: ConstructorParameters<typeof StatofuStoreImpl>
): StatofuStore {
  return new StatofuStoreImpl(...args);
}
