(() => {
  /**
   * @type {A}
   */
  const $a = { a: 'a' };

  globalThis.appLogics = {
    test(store, logA) {
      const unsubscribe = store.subscribe($a, (newA, oldA) => {
        logA(newA);
        logA(oldA);
      });

      store.operate($a, { a: 'a+' });

      unsubscribe();

      store.operate($a, (a) => {
        logA(a);
        return { a: 'a++' };
      });

      logA(store.snapshot($a));
    },
  };

  if (typeof module !== 'undefined') module.exports = {};
})();
