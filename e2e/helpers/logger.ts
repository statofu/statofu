import os from 'node:os';
import { inspect } from 'node:util';

export function stdoutLog(...texts: unknown[]) {
  const { stdout } = process;
  stdout.write(os.EOL);
  stdout.write(
    texts
      .map((t) => {
        return typeof t === 'string'
          ? t
          : inspect(t, {
              colors: stdout.hasColors(),
            });
      })
      .join(' ')
  );
  stdout.write(os.EOL);
}
