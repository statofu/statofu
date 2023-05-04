import { SpawnSyncReturns } from 'node:child_process';

export function throwErrIfNpmErr(
  spawnSyncReturns: SpawnSyncReturns<Buffer> | SpawnSyncReturns<string>,
  errorMessage: string
): void {
  if (spawnSyncReturns.stderr.toString().includes('ERR!')) {
    throw new Error(errorMessage);
  }
}
