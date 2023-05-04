import { SpawnSyncReturns } from 'node:child_process';
import os from 'node:os';

export function throwErrIfNpmErr(
  spawnSyncReturns: SpawnSyncReturns<Buffer> | SpawnSyncReturns<string>,
  errorMessage: string
): void {
  const errStr = spawnSyncReturns.stderr.toString();
  if (errStr.includes('ERR!')) {
    throw new Error(`${errorMessage}:${os.EOL}  ${errStr}`);
  }
}
