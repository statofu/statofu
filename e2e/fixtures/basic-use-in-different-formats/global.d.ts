const statofu: typeof import('statofu');

interface A {
  a: string;
}

var appLogics: {
  test(store: import('statofu').StatofuStore, logA: (a: A) => void): void;
};
