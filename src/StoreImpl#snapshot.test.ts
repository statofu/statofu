import { StatofuStoreImpl } from './StoreImpl';
import { ERR_MSG_INVALID_STATES } from './utils';

interface A {
  a: string;
}
const $a: A = { a: 'a' };

interface B {
  b: string;
}
const $b: B = { b: 'b' };

interface C {
  c: string;
}
const $c: C = { c: 'c' };

describe('snapshotting one state with no selector', () => {
  test(
    'on no state yet saved to the one, ' +
      'a copy of the one $state is saved to the one and is returned, ' +
      'the saved state of the one can be re-snapshotted as it is',
    () => {
      const store = new StatofuStoreImpl();

      const a1 = store.snapshot($a);
      expect(a1).not.toBe($a);
      expect(a1).toStrictEqual($a);

      const a2 = store.snapshot($a);
      expect(a2).toBe(a1);
    }
  );

  test(
    'on a state already saved to the one by operating, ' +
      'the state of the one is returned as it is',
    () => {
      const store = new StatofuStoreImpl();
      const a1 = store.operate($a, { a: 'a+' });

      const a2 = store.snapshot($a);
      expect(a2).toBe(a1);
    }
  );
});

test(
  'snapshotting one state with a selector but no payload, ' +
    'the state of the one is passed into the selector, ' +
    'a selected value is returned',
  () => {
    const store = new StatofuStoreImpl();
    const a1: A = { a: 'a+' };
    store.operate($a, a1);

    const v1 = { v: 'v+' };
    const selector = jest.fn((a) => {
      expect(a).toBe(a1);
      return v1;
    });
    const v2 = store.snapshot($a, selector);
    expect(selector).toHaveBeenCalledOnce();
    expect(v2).toBe(v1);
  }
);

test(
  'snapshotting one state with a selector and payloads, ' +
    'the state of the one and the payloads are passed into the selector, ' +
    'a selected value is returned',
  () => {
    const store = new StatofuStoreImpl();
    const a1: A = { a: 'a+' };
    store.operate($a, a1);

    const v1 = { v: 'v+' };
    const p1 = { p: 'p+' };
    const q1 = { q: 'q+' };
    const selector = jest.fn((a, p, q) => {
      expect(a).toBe(a1);
      expect(p).toBe(p1);
      expect(q).toBe(q1);
      return v1;
    });
    const v2 = store.snapshot($a, selector, p1, q1);
    expect(selector).toHaveBeenCalledOnce();
    expect(v1).toBe(v2);
  }
);

test(
  'snapshotting multi states with no selector, ' +
    'on states already saved to parts of the multi by operating and snapshotting, ' +
    'copies of the not-yet-saved $states in the multi are saved to the not-yet-saved, ' +
    'the newly saved states and the already saved states in the multi are returned, ' +
    'the newly saved states can be re-snapshotted as each of them is',
  () => {
    const store = new StatofuStoreImpl();
    const a1 = store.operate($a, { a: 'a+' });
    const b1 = store.snapshot($b);

    const [a2, b2, c1] = store.snapshot([$a, $b, $c]);
    expect(a2).toBe(a1);
    expect(b2).toBe(b1);
    expect(c1).not.toBe($c);
    expect(c1).toStrictEqual($c);

    const c2 = store.snapshot($c);
    expect(c2).toBe(c1);
  }
);

test(
  'snapshotting multi states with a selector but no payload, ' +
    'the states of the multi are passed into the selector, ' +
    'a selected value is returned',
  () => {
    const store = new StatofuStoreImpl();
    const a1: A = { a: 'a+' };
    const b1: B = { b: 'b+' };
    store.operate([$a, $b], [a1, b1]);

    const v1 = { v: 'v' };
    const selector = jest.fn(([a, b]) => {
      expect(a).toBe(a1);
      expect(b).toBe(b1);
      return v1;
    });
    const v2 = store.snapshot([$a, $b], selector);
    expect(selector).toHaveBeenCalledOnce();
    expect(v2).toBe(v1);
  }
);

test(
  'snapshotting multi states with a selector and payloads, ' +
    'the states of the multi and the payloads are passed into the selector, ' +
    'a selected value is returned',
  () => {
    const store = new StatofuStoreImpl();
    const a1: A = { a: 'a+' };
    const b1: B = { b: 'b+' };
    store.operate([$a, $b], [a1, b1]);

    const v1 = { v: 'v' };
    const p1 = { p: 'p+' };
    const q1 = { q: 'q+' };
    const selector = jest.fn(([a, b], p, q) => {
      expect(a).toBe(a1);
      expect(b).toBe(b1);
      expect(p).toBe(p1);
      expect(q).toBe(q1);
      return v1;
    });
    const v2 = store.snapshot([$a, $b], selector, p1, q1);
    expect(selector).toHaveBeenCalledOnce();
    expect(v2).toBe(v1);
  }
);

test('snapshotting a tuple of $states containing ref-identical $states, an error of invalid states is thrown', () => {
  const store = new StatofuStoreImpl();

  expect(() => store.snapshot([$a, $a, $b])).toThrow(ERR_MSG_INVALID_STATES);
});
