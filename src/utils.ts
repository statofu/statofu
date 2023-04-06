export function arraysEqual<T = unknown>(a: T[], b: T[]): boolean {
  if (a === b) return true;

  if (a.length !== b.length) return false;

  for (let i = 0, n = a.length; i < n; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}
