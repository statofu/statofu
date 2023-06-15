(() => {
  /**
   * @type {A}
   */
  const $a = { a: 'a' };

  globalThis.appLogics = {
    testCore(store, log) {
      const unsubscribe = store.subscribe($a, (newA, oldA) => {
        log(newA);
        log(oldA);
      });

      store.operate($a, { a: 'a+' });

      unsubscribe();

      store.operate($a, (a) => {
        log(a);
        return { a: 'a++' };
      });

      log(store.snapshot($a));
    },

    testSsr(store, { foldStates, unfoldStates }, log) {
      store.operate($a, { a: 'a+' });

      const stateFolder = foldStates(store, { $a });

      store.clear();

      log(store.snapshot($a));
      unfoldStates(store, { $a }, stateFolder);
      log(store.snapshot($a));
    },
  };

  if (typeof module !== 'undefined') module.exports = {};
})();
