import { StatofuStoreImpl } from './StoreImpl';
import { ERR_MSG_INVALID_STATES } from './utils';

interface A {
  a: string;
}
const $a: A = { a: 'a+' };

interface B {
  b: string;
}
const $b: B = { b: 'b+' };

interface C {
  c: string;
}
const $c: C = { c: 'c+' };

test(
  'operating one state directly using a state of the one, ' +
    'the state is saved to the one and is returned, ' +
    'the saved state can be snapshotted as it is',
  () => {
    const store = new StatofuStoreImpl();

    const a1: A = { a: 'a+' };
    const a2 = store.operate($a, a1);
    expect(a2).toBe(a1);
    const a3 = store.snapshot($a);
    expect(a3).toBe(a1);
  }
);

test(
  'operating one state using a getter of the one, ' +
    'the state from the getter is saved to the one and is returned, ' +
    'the saved state can be snapshotted as it is',
  () => {
    const store = new StatofuStoreImpl();

    const a1: A = { a: 'a+' };
    const getter = jest.fn(() => a1);
    const a2 = store.operate($a, getter);
    expect(getter).toHaveBeenCalledOnce();
    expect(a2).toBe(a1);
    const a3 = store.snapshot($a);
    expect(a3).toBe(a1);
  }
);

describe(
  'operating one state using a one-state reducer to the one with no payload, ' +
    'the state from the reducer is saved to the one and is returned, ' +
    'the saved state can be snapshotted as it is',
  () => {
    test('on no state yet saved to the one, a copy of the one $state is passed into the reducer', () => {
      const store = new StatofuStoreImpl();

      const a1: A = { a: 'a+' };
      const reducer = jest.fn((a) => {
        expect(a).not.toBe($a);
        expect(a).toStrictEqual($a);
        return a1;
      });
      const a2 = store.operate($a, reducer);
      expect(reducer).toHaveBeenCalledOnce();
      expect(a2).toBe(a1);

      const a3 = store.snapshot($a);
      expect(a3).toBe(a1);
    });

    test(
      'on states already saved to the one by operating, ' +
        'the already saved state of the one is passed into the reducer',
      () => {
        const store = new StatofuStoreImpl();
        const a1 = store.operate($a, { a: 'a+' });

        const a2: A = { a: 'a++' };
        const reducer = jest.fn((a) => {
          expect(a).toBe(a1);
          return a2;
        });
        const a3 = store.operate($a, reducer);
        expect(reducer).toHaveBeenCalledOnce();
        expect(a3).toBe(a2);

        const a4 = store.snapshot($a);
        expect(a4).toBe(a2);
      }
    );

    test(
      'on states already saved to the one by snapshotting, ' +
        'the already saved state of the one is passed into the reducer',
      () => {
        const store = new StatofuStoreImpl();
        const a1 = store.snapshot($a);

        const a2: A = { a: 'a++' };
        const reducer = jest.fn((a) => {
          expect(a).toBe(a1);
          return a2;
        });
        const a3 = store.operate($a, reducer);
        expect(reducer).toHaveBeenCalledOnce();
        expect(a3).toBe(a2);

        const a4 = store.snapshot($a);
        expect(a4).toBe(a2);
      }
    );
  }
);

test(
  'operating one state using a reducer to the one with payloads, ' +
    'the state of the one and the payloads are passed into the reducer, ' +
    'the state from the reducer is saved to the one and is returned, ' +
    'the saved state can be snapshotted as it is',
  () => {
    const store = new StatofuStoreImpl();
    const a1: A = { a: 'a+' };
    store.operate($a, a1);

    const a2: A = { a: 'a++' };
    const p1 = { p: 'p+' };
    const q1 = { q: 'q+' };
    const reducer = jest.fn((a, p, q) => {
      expect(a).toBe(a1);
      expect(p).toBe(p1);
      expect(q).toBe(q1);
      return a2;
    });
    const a3 = store.operate($a, reducer, p1, q1);
    expect(reducer).toHaveBeenCalledOnce();
    expect(a3).toBe(a2);

    const a4 = store.snapshot($a);
    expect(a4).toBe(a2);
  }
);

test(
  'operating multi states directly using states of the multi, ' +
    'the states are saved to the multi and are returned, ' +
    'the saved states can be snapshotted as each of them is',
  () => {
    const store = new StatofuStoreImpl();

    const a1: A = { a: 'a+' };
    const b1: B = { b: 'b+' };
    const [a2, b2] = store.operate([$a, $b], [a1, b1]);
    expect(a2).toBe(a1);
    expect(b2).toBe(b1);
    const [a3, b3] = store.snapshot([$a, $b]);
    expect(a3).toBe(a1);
    expect(b3).toBe(b1);
  }
);

test(
  'operating multi states using a getter of the multi, ' +
    'the states from the getter are saved to the multi and are returned, ' +
    'the saved states can be snapshotted as each of them is',
  () => {
    const store = new StatofuStoreImpl();

    const a1: A = { a: 'a+' };
    const b1: B = { b: 'b+' };
    const [a2, b2] = store.operate([$a, $b], () => [a1, b1]);
    expect(a2).toBe(a1);
    expect(b2).toBe(b1);
    const [a3, b3] = store.snapshot([$a, $b]);
    expect(a3).toBe(a1);
    expect(b3).toBe(b1);
  }
);

test(
  'operating multi states using a reducer to the multi with no payload, ' +
    'on states already saved to parts of the multi by operating and snapshotting, ' +
    'copies of the not-yet-saved $states in the multi and ' +
    'the already saved states in the multi are passed into the reducer, ' +
    'the states from the reducer are saved to the multi and are returned, ' +
    'the saved states can be snapshotted as each of them is',
  () => {
    const store = new StatofuStoreImpl();
    const a1 = store.operate($a, { a: 'a+' });
    const b1 = store.snapshot($b);

    const a2: A = { a: 'a++' };
    const b2: B = { b: 'b++' };
    const c1: C = { c: 'c+' };
    const reducer = jest.fn(([a, b, c]): [A, B, C] => {
      expect(a).toBe(a1);
      expect(b).toBe(b1);
      expect(c).not.toBe($c);
      expect(c).toStrictEqual($c);
      return [a2, b2, c1];
    });
    const [a3, b3, c2] = store.operate([$a, $b, $c], reducer);
    expect(reducer).toHaveBeenCalledOnce();
    expect(a3).toBe(a2);
    expect(b3).toBe(b2);
    expect(c2).toBe(c1);

    const [a4, b4, c3] = store.snapshot([$a, $b, $c]);
    expect(a4).toBe(a2);
    expect(b4).toBe(b2);
    expect(c3).toBe(c1);
  }
);

test(
  'operating multi states using a reducer to the multi with payloads, ' +
    'the states of the multi and the payloads are passed into the reducer, ' +
    'the states from the reducer are saved to the multi and are returned, ' +
    'the saved states can be snapshotted as each of them is',
  () => {
    const store = new StatofuStoreImpl();
    const a1: A = { a: 'a+' };
    const b1: B = { b: 'b+' };
    store.operate([$a, $b], [a1, b1]);

    const a2: A = { a: 'a++' };
    const b2: B = { b: 'b++' };
    const p1 = { p: 'p+' };
    const q1 = { q: 'q+' };
    const reducer = jest.fn(([a, b], p, q): [A, B] => {
      expect(a).toBe(a1);
      expect(b).toBe(b1);
      expect(p).toBe(p1);
      expect(q).toBe(q1);
      return [a2, b2];
    });
    const [a3, b3] = store.operate([$a, $b], reducer, p1, q1);
    expect(reducer).toHaveBeenCalledOnce();
    expect(a3).toBe(a2);
    expect(b3).toBe(b2);

    const [a4, b4] = store.snapshot([$a, $b]);
    expect(a4).toBe(a2);
    expect(b4).toBe(b2);
  }
);

test('operating a tuple of $states containing ref-identical $states, an error of invalid states is thrown', () => {
  const store = new StatofuStoreImpl();

  expect(() => store.operate([$a, $a, $b], [{ a: 'a+' }, { a: 'a++' }, { b: 'b+' }])).toThrow(
    ERR_MSG_INVALID_STATES
  );
});

test(
  'calling _setOneOrMultiStatesOnly with a tuple of $states containing ref-identical $states, ' +
    'an error of invalid states is thrown',
  () => {
    const store = new StatofuStoreImpl();

    expect(() =>
      store._setOneOrMultiStatesOnly([$a, $a, $b], [{ a: 'a+' }, { a: 'a++' }, { b: 'b+' }])
    ).toThrow(ERR_MSG_INVALID_STATES);
  }
);
