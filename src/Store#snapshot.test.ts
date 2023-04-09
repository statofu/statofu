import { StatofuStore } from './Store';

describe('snapshotting on no state yet saved', () => {
  test('a copy of one given $state is returned', () => {
    const store = new StatofuStore();
    const $a = { a: 'a' };

    const a1 = store.snapshot($a);
    expect(a1).not.toBe($a);
    expect(a1).toEqual($a);
  });

  describe('the initially returned copy of one given $state is saved and can be revisited as it is', () => {
    test('by the one $state', () => {
      const store = new StatofuStore();
      const $a = { a: 'a' };

      const a1 = store.snapshot($a);
      const a2 = store.snapshot($a);
      expect(a2).toBe(a1);
    });

    test(
      'by some other multi $states containing the one, ' +
        'along with copies of the rest $states returned',
      () => {
        const store = new StatofuStore();
        const $a = { a: 'a' };
        const $b = { b: 'b' };

        const a1 = store.snapshot($a);
        const [a2, b2] = store.snapshot([$a, $b]);
        expect(a1).toBe(a2);
        expect(b2).not.toBe($b);
        expect(b2).toEqual($b);
      }
    );
  });

  test('copies of multi given $states are returned', () => {
    const store = new StatofuStore();
    const $a = { a: 'a' };
    const $b = { b: 'b' };

    const [a1, b1] = store.snapshot([$a, $b]);
    expect(a1).not.toBe($a);
    expect(a1).toEqual($a);
    expect(b1).not.toBe($b);
    expect(b1).toEqual($b);
  });

  describe('the initially returned copies of multi given $states are saved and can be revisited as each of them is', () => {
    test('by the multi $states', () => {
      const store = new StatofuStore();
      const $a = { a: 'a' };
      const $b = { b: 'b' };

      const [a1, b1] = store.snapshot([$a, $b]);
      const [a2, b2] = store.snapshot([$a, $b]);
      expect(a2).toBe(a1);
      expect(b2).toBe(b1);
    });

    test('by each $state of the multi', () => {
      const store = new StatofuStore();
      const $a = { a: 'a' };
      const $b = { b: 'b' };

      const [a1, b1] = store.snapshot([$a, $b]);
      const a2 = store.snapshot($a);
      const b2 = store.snapshot($b);
      expect(a2).toBe(a1);
      expect(b2).toBe(b1);
    });

    test(
      'by some other multi $states containing the multi, ' +
        'along with copies of the rest $states returned',
      () => {
        const store = new StatofuStore();
        const $a = { a: 'a' };
        const $b = { b: 'b' };
        const $c = { c: 'c' };

        const [a1, b1] = store.snapshot([$a, $b]);
        const [a2, b2, c2] = store.snapshot([$a, $b, $c]);
        expect(a1).toBe(a2);
        expect(b1).toBe(b2);
        expect(c2).not.toBe($c);
        expect(c2).toEqual($c);
      }
    );
  });

  describe('with value selectors to return selected values', () => {
    test('a copy of one given $state gets used', () => {
      const store = new StatofuStore();
      const $a = { a: 'a' };

      const v = store.snapshot($a, (a) => {
        expect(a).not.toBe($a);
        expect(a).toEqual($a);
        return a.a;
      });
      expect(v).toEqual($a.a);
    });

    describe('the initially used copy of one given $state is saved and can be reused as it is', () => {
      test('by the one $state', () => {
        const store = new StatofuStore();
        const $a = { a: 'a' };

        let a1!: typeof $a;
        store.snapshot($a, (a) => {
          a1 = a;
        });
        const v = store.snapshot($a, (a) => {
          expect(a).toBe(a1);
          return a.a;
        });
        expect(v).toEqual(a1.a);
      });

      test(
        'by some other multi $states containing the one, ' +
          'along with copies of the rest $states used',
        () => {
          const store = new StatofuStore();
          const $a = { a: 'a' };
          const $b = { b: 'b' };

          let a1!: typeof $a;
          store.snapshot($a, (a) => {
            a1 = a;
          });
          const v = store.snapshot([$a, $b], ([a, b]) => {
            expect(a).toBe(a1);
            expect(b).not.toBe($b);
            expect(b).toEqual($b);
            return a.a + b.b;
          });
          expect(v).toEqual(a1.a + $b.b);
        }
      );
    });

    test('copies of multi given $states get used', () => {
      const store = new StatofuStore();
      const $a = { a: 'a' };
      const $b = { b: 'b' };

      const v = store.snapshot([$a, $b], ([a, b]) => {
        expect(a).not.toBe($a);
        expect(a).toEqual($a);
        expect(b).not.toBe($b);
        expect(b).toEqual($b);
        return a.a + b.b;
      });
      expect(v).toEqual($a.a + $b.b);
    });

    describe('the initially used copies of multi given $states are saved and can be reused as each of them is', () => {
      test('by the multi $states', () => {
        const store = new StatofuStore();
        const $a = { a: 'a' };
        const $b = { b: 'b' };

        let a1!: typeof $a;
        let b1!: typeof $b;
        store.snapshot([$a, $b], ([a, b]) => {
          a1 = a;
          b1 = b;
        });
        const v = store.snapshot([$a, $b], ([a, b]) => {
          expect(a).toBe(a1);
          expect(b).toBe(b1);
          return a.a + b.b;
        });
        expect(v).toEqual(a1.a + b1.b);
      });

      test('by each $state of the multi', () => {
        const store = new StatofuStore();
        const $a = { a: 'a' };
        const $b = { b: 'b' };

        let a1!: typeof $a;
        let b1!: typeof $b;
        store.snapshot([$a, $b], ([a, b]) => {
          a1 = a;
          b1 = b;
        });

        const v_a = store.snapshot($a, (a) => {
          expect(a).toBe(a1);
          return a.a;
        });
        expect(v_a).toEqual(a1.a);

        const v_b = store.snapshot($b, (b) => {
          expect(b).toBe(b1);
          return b.b;
        });
        expect(v_b).toEqual(b1.b);
      });

      test(
        'by some other multi $states containing the one, ' +
          'along with copies of the rest $states used',
        () => {
          const store = new StatofuStore();
          const $a = { a: 'a' };
          const $b = { b: 'b' };
          const $c = { c: 'c' };

          let a1!: typeof $a;
          let b1!: typeof $b;
          store.snapshot([$a, $b], ([a, b]) => {
            a1 = a;
            b1 = b;
          });

          const v = store.snapshot([$a, $b, $c], ([a, b, c]) => {
            expect(a).toBe(a1);
            expect(b).toBe(b1);
            expect(c).not.toBe($c);
            expect(c).toEqual($c);
            return a.a + b.b + c.c;
          });
          expect(v).toEqual(a1.a + b1.b + $c.c);
        }
      );
    });
  });
});

describe('snapshotting on states already saved', () => {
  test('the already saved state of one given $state is returned as it is', () => {
    const store = new StatofuStore();
    const $a = { a: 'a' };
    const a1: typeof $a = { a: 'a+' };
    store.operate($a, a1);

    const a2 = store.snapshot($a);
    expect(a2).toBe(a1);
  });

  test('the initially returned state of one given $state can be revisited as it is', () => {
    const store = new StatofuStore();
    const $a = { a: 'a' };
    store.operate($a, { a: 'a+' });
    const a1 = store.snapshot($a);

    const a2 = store.snapshot($a);
    expect(a2).toBe(a1);
  });

  test('the already saved states of multi given $states are returned as each of them is', () => {
    const store = new StatofuStore();
    const $a = { a: 'a' };
    const $b = { b: 'b' };
    const a1: typeof $a = { a: 'a+' };
    const b1: typeof $b = { b: 'b+' };
    store.operate([$a, $b], [a1, b1]);

    const [a2, b2] = store.snapshot([$a, $b]);
    expect(a2).toBe(a1);
    expect(b2).toBe(b1);
  });

  describe('the initially returned states of multi given $states can be revisited as each of them is', () => {
    test('by the multi $states', () => {
      const store = new StatofuStore();
      const $a = { a: 'a' };
      const $b = { b: 'b' };
      store.operate([$a, $b], [{ a: 'a+' }, { b: 'b+' }]);
      const [a1, b1] = store.snapshot([$a, $b]);

      const [a2, b2] = store.snapshot([$a, $b]);
      expect(a2).toBe(a1);
      expect(b2).toBe(b1);
    });

    test('by each $state of the multi', () => {
      const store = new StatofuStore();
      const $a = { a: 'a' };
      const $b = { b: 'b' };
      store.operate([$a, $b], [{ a: 'a+' }, { b: 'b+' }]);
      const [a1, b1] = store.snapshot([$a, $b]);

      const [a2, b2] = store.snapshot([$a, $b]);
      expect(a2).toBe(a1);
      expect(b2).toBe(b1);
    });
  });

  describe('with value selectors to return selected values', () => {
    test('the already saved state of one given $state gets used as it is', () => {
      const store = new StatofuStore();
      const $a = { a: 'a' };
      const a1: typeof $a = { a: 'a+' };
      store.operate($a, a1);

      const v = store.snapshot($a, (a) => {
        expect(a).toBe(a1);
        return a.a;
      });
      expect(v).toEqual(a1.a);
    });

    test('the initially used state of one given $state can be reused as it is', () => {
      const store = new StatofuStore();
      const $a = { a: 'a' };
      store.operate($a, { a: 'a+' });
      let a1!: typeof $a;
      store.snapshot($a, (a) => {
        a1 = a;
      });

      const v = store.snapshot($a, (a) => {
        expect(a).toBe(a1);
        return a.a;
      });
      expect(v).toEqual(a1.a);
    });

    test('the already saved states of multi given $states are used as each of them is', () => {
      const store = new StatofuStore();
      const $a = { a: 'a' };
      const $b = { b: 'b' };
      const a1: typeof $a = { a: 'a+' };
      const b1: typeof $b = { b: 'b+' };
      store.operate([$a, $b], [a1, b1]);

      const v = store.snapshot([$a, $b], ([a, b]) => {
        expect(a).toBe(a1);
        expect(b).toBe(b1);
        return a.a + b.b;
      });
      expect(v).toEqual(a1.a + b1.b);
    });

    describe('the initially used states of multi given $states can be reused as each of them is', () => {
      test('by the multi $states', () => {
        const store = new StatofuStore();
        const $a = { a: 'a' };
        const $b = { b: 'b' };
        store.operate([$a, $b], [{ a: 'a+' }, { b: 'b+' }]);
        let a1!: typeof $a;
        let b1!: typeof $b;
        store.snapshot([$a, $b], ([a, b]) => {
          a1 = a;
          b1 = b;
        });

        const v = store.snapshot([$a, $b], ([a, b]) => {
          expect(a).toBe(a1);
          expect(b).toBe(b1);
          return a.a + b.b;
        });
        expect(v).toEqual(a1.a + b1.b);
      });

      test('by each $state of the multi', () => {
        const store = new StatofuStore();
        const $a = { a: 'a' };
        const $b = { b: 'b' };
        store.operate([$a, $b], [{ a: 'a+' }, { b: 'b+' }]);
        let a1!: typeof $a;
        let b1!: typeof $b;
        store.snapshot([$a, $b], ([a, b]) => {
          a1 = a;
          b1 = b;
        });

        const v_a = store.snapshot($a, (a) => {
          expect(a).toBe(a1);
          return a.a;
        });
        expect(v_a).toEqual(a1.a);

        const v_b = store.snapshot($b, (b) => {
          expect(b).toBe(b1);
          return b.b;
        });
        expect(v_b).toEqual(b1.b);
      });
    });
  });
});
