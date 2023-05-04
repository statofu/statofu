import { Readable } from 'node:stream';

export async function waitForTextInStream(
  text: string,
  stream: Readable,
  timeout: number = 5000
): Promise<string> {
  return await new Promise((resolve, reject) => {
    let output: string = '';

    let done = false;

    stream.on('readable', () => {
      if (done) return;

      const chunk: Buffer | string | null = stream.read();

      if (chunk === null) {
        done = true;
        reject(new Error(`Text '${text}' not found`));
      } else {
        output += chunk.toString();
        if (output.includes(text)) {
          done = true;
          resolve(output);
        }
      }
    });

    setTimeout(() => {
      if (done) return;
      done = true;
      reject(new Error('Time is out'));
    }, timeout);
  });
}

export async function waitForMs(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
