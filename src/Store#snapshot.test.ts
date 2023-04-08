import { StatofuStore } from './Store';

describe('snapshotting with no state yet saved', () => {
  test('a copy of one given $state is returned', () => {
    const store = new StatofuStore();
    const $a = { a: 0 };

    const a1 = store.snapshot($a);
    expect(a1).not.toBe($a);
    expect(a1).toEqual($a);
  });

  test('the initially returned copy of one given $state is saved and can be revisited as it is', () => {
    const store = new StatofuStore();
    const $a = { a: 'a' };

    const a1 = store.snapshot($a);
    const a2 = store.snapshot($a);
    expect(a2).toEqual(a1);
  });

  test(
    'the initially returned copy of one given $state is saved and be can revisited as it is, ' +
      'by some other multi $states containing the one, along with copies of the rest $states returned',
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

  test(
    'the initially returned copies of multi given $states are saved and can be revisited as each of them is, ' +
      'by the multi $states',
    () => {
      const store = new StatofuStore();
      const $a = { a: 'a' };
      const $b = { b: 'b' };

      const [a1, b1] = store.snapshot([$a, $b]);
      const [a2, b2] = store.snapshot([$a, $b]);
      expect(a2).toBe(a1);
      expect(b2).toBe(b1);
    }
  );

  test(
    'the initially returned copies of multi given $states are saved and can be revisited as each of them is, ' +
      'per $state of the multi',
    () => {
      const store = new StatofuStore();
      const $a = { a: 'a' };
      const $b = { b: 'b' };

      const [a1, b1] = store.snapshot([$a, $b]);
      const a2 = store.snapshot($a);
      const b2 = store.snapshot($b);
      expect(a2).toBe(a1);
      expect(b2).toBe(b1);
    }
  );

  test(
    'the initially returned copies of multi given $states are saved and can be revisited as each of them is, ' +
      'by some other multi $states containing the multi, along with copies of the rest $states returned',
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

describe('snapshotting with states already saved', () => {
  test('the already saved state of one given $state is returned as it is', () => {
    const store = new StatofuStore();
    const $a = { a: 'a' };
    const a1: typeof $a = { a: 'a+' };
    store.operate($a, a1);

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
});
