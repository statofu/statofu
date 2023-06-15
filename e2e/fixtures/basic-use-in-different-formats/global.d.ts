var statofu: typeof import('statofu');
var statofuSsr: typeof import('statofu/ssr');

interface A {
  a: string;
}

var appLogics: {
  testCore(store: import('statofu').StatofuStore, log: (o: unknown) => void): void;

  testSsr(
    store: import('statofu').StatofuStore,
    ssrHelpers: Pick<typeof import('statofu/ssr'), 'foldStates' | 'unfoldStates'>,
    log: (o: unknown) => void
  ): void;
};
