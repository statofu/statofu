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

interface D {
  d: string;
}
const $d: D = { d: 'd' };

interface E {
  e: string;
}
const $e: E = { e: 'e' };

describe('a listener subscribing any-state changes is not called on ...', () => {
  test('on on the one not-yet-saved state snapshotted', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe(listener);
    store.snapshot($a);
    expect(listener).not.toHaveBeenCalled();
  });

  test('on the not-yet-saved multi states snapshotted', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe(listener);
    store.snapshot([$a, $b]);
    expect(listener).not.toHaveBeenCalled();
  });

  test('on one state operated but unchanged', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe(listener);
    store.operate($a, (a) => a);
    expect(listener).not.toHaveBeenCalled();
  });

  test('on multi states operated but all unchanged', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe(listener);
    store.operate([$a, $b], ([a, b]) => [a, b]);
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('a listener subscribing any-state changes is called once with new states and old states on ...', () => {
  describe('on the one operated and changed', () => {
    test('on no state yet saved to the one, with a copy of the one $state as the old state', () => {
      const store = new StatofuStoreImpl();

      const a1: A = { a: 'a+' };
      const listener = jest.fn((newA, oldA) => {
        expect(newA).toBe(a1);
        expect(oldA).not.toBe($a);
        expect(oldA).toStrictEqual($a);
      });
      store.subscribe(listener);
      store.operate($a, a1);
      expect(listener).toHaveBeenCalledOnce();
    });

    test(
      'on a state already saved to the one by operating, ' +
        'with the already saved state of the one as the old state',
      () => {
        const store = new StatofuStoreImpl();
        const a1 = store.operate($a, { a: 'a+' });

        const a2: A = { a: 'a++' };
        const listener = jest.fn((newA, oldA) => {
          expect(newA).toBe(a2);
          expect(oldA).toBe(a1);
        });
        store.subscribe(listener);
        store.operate($a, a2);
        expect(listener).toHaveBeenCalledOnce();
      }
    );

    test(
      'on a state already saved to the one by snapshotting, ' +
        'with the already saved state of the one as the old state',
      () => {
        const store = new StatofuStoreImpl();
        const a1: A = store.snapshot($a);

        const a2: A = { a: 'a++' };
        const listener = jest.fn((newA, oldA) => {
          expect(newA).toBe(a2);
          expect(oldA).toBe(a1);
        });
        store.subscribe(listener);
        store.operate($a, a2);
        expect(listener).toHaveBeenCalledOnce();
      }
    );
  });

  describe('on multi states operated and partially changed', () => {
    test('on no state yet saved to the multi, with copies of the multi $states as the old states', () => {
      const store = new StatofuStoreImpl();

      const a1: A = { a: 'a+' };
      const listener = jest.fn((newStates, oldStates) => {
        expect(newStates).toBeArrayOfSize(2);
        expect(oldStates).toBeArrayOfSize(2);

        const [newA, newB] = newStates;
        const [oldA, oldB] = oldStates;

        expect(newA).toBe(a1);
        expect(newB).toBe(oldB);

        expect(oldA).not.toBe($a);
        expect(oldA).toStrictEqual($a);
        expect(oldB).not.toBe($b);
        expect(oldB).toStrictEqual($b);
      });
      store.subscribe(listener);
      store.operate([$a, $b], ([, b]) => [a1, b]);
      expect(listener).toHaveBeenCalledOnce();
    });

    test(
      'on states already saved to the changed in the multi and the unchanged in the multi ' +
        'by operating and snapshotting, ' +
        'with the already saved states of the multi as the old states',
      () => {
        const store = new StatofuStoreImpl();
        const [a1, c1] = store.operate([$a, $c], [{ a: 'a+' }, { c: 'c+' }]);
        const [b1, d1] = store.snapshot([$b, $d]);

        const a2: A = { a: 'a++' };
        const b2: B = { b: 'b++' };
        const listener = jest.fn((newStates, oldStates) => {
          expect(newStates).toBeArrayOfSize(4);
          expect(oldStates).toBeArrayOfSize(4);

          const [newA, newB, newC, newD] = newStates;
          const [oldA, oldB, oldC, oldD] = oldStates;

          expect(newA).toBe(a2);
          expect(newB).toBe(b2);
          expect(newC).toBe(oldC);
          expect(newD).toBe(oldD);

          expect(oldA).toBe(a1);
          expect(oldB).toBe(b1);
          expect(oldC).toBe(c1);
          expect(oldD).toBe(d1);
        });
        store.subscribe(listener);
        store.operate([$a, $b, $c, $d], ([, , c, d]) => [a2, b2, c, d]);
        expect(listener).toHaveBeenCalledOnce();
      }
    );
  });
});

describe('a listener subscribing one-state changes is not called on ...', () => {
  test('on the yet-saved-saved one state snapshotted', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe($a, listener);
    store.snapshot($a);
    expect(listener).not.toHaveBeenCalled();
  });

  test('on other one state operated and changed', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe($a, listener);
    store.operate($b, { b: 'b+' });
    expect(listener).not.toHaveBeenCalled();
  });

  test('on the one state operated but unchanged', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe($a, listener);
    store.operate($a, (a) => a);
    expect(listener).not.toHaveBeenCalled();
  });

  test('on some multi states not containing the one operated and all changed', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe($a, listener);
    store.operate([$b, $c], [{ b: 'b+' }, { c: 'c+' }]);
    expect(listener).not.toHaveBeenCalled();
  });

  test(
    'on some multi states containing the one operated, ' +
      'if the one stays unchanged despite the rest all changed',
    () => {
      const store = new StatofuStoreImpl();

      const listener = jest.fn();
      store.subscribe($a, listener);
      store.operate([$a, $b], ([a]) => [a, { b: 'b+' }]);
      expect(listener).not.toHaveBeenCalled();
    }
  );
});

describe('a listener subscribing one-state changes is called once with a new state and an old state on ...', () => {
  describe('on the one state operated and changed', () => {
    test('on no state yet saved to the one, with a copy of the one $state as the old state', () => {
      const store = new StatofuStoreImpl();

      const a1: A = { a: 'a+' };
      const listener = jest.fn((newA, oldA) => {
        expect(newA).toBe(a1);
        expect(oldA).not.toBe($a);
        expect(oldA).toStrictEqual($a);
      });
      store.subscribe($a, listener);
      store.operate($a, a1);
      expect(listener).toHaveBeenCalledOnce();
    });

    test(
      'on a state already saved to the one by operating, ' +
        'with the already saved state of the one as the old state',
      () => {
        const store = new StatofuStoreImpl();
        const a1 = store.operate($a, { a: 'a+' });

        const a2: A = { a: 'a++' };
        const listener = jest.fn((newA, oldA) => {
          expect(newA).toBe(a2);
          expect(oldA).toBe(a1);
        });
        store.subscribe($a, listener);
        store.operate($a, a2);
        expect(listener).toHaveBeenCalledOnce();
      }
    );

    test(
      'on a state already saved to the one by snapshotting, ' +
        'with the already saved state of the one as the old state',
      () => {
        const store = new StatofuStoreImpl();
        const a1 = store.snapshot($a);

        const a2: A = { a: 'a++' };
        const listener = jest.fn((newA, oldA) => {
          expect(newA).toBe(a2);
          expect(oldA).toBe(a1);
        });
        store.subscribe($a, listener);
        store.operate($a, a2);
        expect(listener).toHaveBeenCalledOnce();
      }
    );
  });

  test(
    'on some multi states containing the one operated, ' +
      'if the one is changed despite the rest all unchanged',
    () => {
      const store = new StatofuStoreImpl();
      const a1 = store.operate($a, { a: 'a+' });

      const a2: A = { a: 'a++' };
      const listener = jest.fn((newA, oldA) => {
        expect(newA).toBe(a2);
        expect(oldA).toBe(a1);
      });
      store.subscribe($a, listener);
      store.operate([$a, $b], ([, b]) => [a2, b]);
      expect(listener).toHaveBeenCalledOnce();
    }
  );
});

describe('a listener subscribing multi-state changes is not called on ...', () => {
  test('on no state yet saved to the multi, on the multi snapshotted', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe([$a, $b], listener);
    store.snapshot([$a, $b]);
    expect(listener).not.toHaveBeenCalled();
  });

  test('on some one state not contained by the multi operated and changed', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe([$a, $b], listener);
    store.operate($c, { c: 'c+' });
    expect(listener).not.toHaveBeenCalled();
  });

  test('on some one state contained by the multi operated but unchanged', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe([$a, $b], listener);
    store.operate($a, (a) => a);
    expect(listener).not.toHaveBeenCalled();
  });

  test('on the multi operated but all unchanged', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe([$a, $b], listener);
    store.operate([$a, $b], ([a, b]) => [a, b]);
    expect(listener).not.toHaveBeenCalled();
  });

  test('on other multi states not intersecting with the multi operated and all changed', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe([$a, $b], listener);
    store.operate([$c, $d], [{ c: 'c+' }, { d: 'd+' }]);
    expect(listener).not.toHaveBeenCalled();
  });

  test(
    'on other multi states intersecting with the multi operated, ' +
      'if the intersection stays all unchanged despite the rest all changed',
    () => {
      const store = new StatofuStoreImpl();

      const listener = jest.fn();
      store.subscribe([$a, $b], listener);
      store.operate([$b, $c], ([b]) => [b, { c: 'c+' }]);
      expect(listener).not.toHaveBeenCalled();
    }
  );
});

describe('a listener subscribing multi-state changes is called once with new states and old states on ...', () => {
  describe('on the multi states operated and partially changed', () => {
    test('on no state yet saved to the multi, with copies of the multi $states as the old states', () => {
      const store = new StatofuStoreImpl();

      const a1: A = { a: 'a+' };
      const listener = jest.fn((newStates, oldStates) => {
        expect(newStates).toBeArrayOfSize(2);
        expect(oldStates).toBeArrayOfSize(2);

        const [newA, newB] = newStates;
        const [oldA, oldB] = oldStates;

        expect(newA).toBe(a1);
        expect(newB).toBe(oldB);

        expect(oldA).not.toBe($a);
        expect(oldA).toStrictEqual($a);
        expect(oldB).not.toBe($b);
        expect(oldB).toStrictEqual($b);
      });
      store.subscribe([$a, $b], listener);
      store.operate([$a, $b], ([, b]) => [a1, b]);
      expect(listener).toHaveBeenCalledOnce();
    });

    test(
      'on states already saved to the changed in the multi and the unchanged in the multi ' +
        'by operating and snapshotting, ' +
        'with the already saved states of the multi as the old states',
      () => {
        const store = new StatofuStoreImpl();
        const [a1, c1] = store.operate([$a, $c], [{ a: 'a+' }, { c: 'c+' }]);
        const [b1, d1] = store.snapshot([$b, $d]);

        const a2: A = { a: 'a++' };
        const b2: B = { b: 'b++' };
        const listener = jest.fn((newStates, oldStates) => {
          expect(newStates).toBeArrayOfSize(4);
          expect(oldStates).toBeArrayOfSize(4);

          const [newA, newB, newC, newD] = newStates;
          const [oldA, oldB, oldC, oldD] = oldStates;

          expect(newA).toBe(a2);
          expect(newB).toBe(b2);
          expect(newC).toBe(oldC);
          expect(newD).toBe(oldD);

          expect(oldA).toBe(a1);
          expect(oldB).toBe(b1);
          expect(oldC).toBe(c1);
          expect(oldD).toBe(d1);
        });
        store.subscribe([$a, $b, $c, $d], listener);
        store.operate([$a, $b, $c, $d], ([, , c, d]) => [a2, b2, c, d]);
        expect(listener).toHaveBeenCalledOnce();
      }
    );
  });

  test('on some one state contained by the multi operated and changed', () => {
    const store = new StatofuStoreImpl();
    const [a1, b1] = store.operate([$a, $b], [{ a: 'a+' }, { b: 'b+' }]);

    const a2: A = { a: 'a++' };
    const listener = jest.fn((newStates, oldStates) => {
      expect(newStates).toBeArrayOfSize(2);
      expect(oldStates).toBeArrayOfSize(2);

      const [newA, newB] = newStates;
      const [oldA, oldB] = oldStates;

      expect(newA).toBe(a2);
      expect(newB).toBe(oldB);

      expect(oldA).toBe(a1);
      expect(oldB).toBe(b1);
    });
    store.subscribe([$a, $b], listener);
    store.operate($a, a2);
    expect(listener).toHaveBeenCalledOnce();
  });

  test(
    'on other multi states intersecting with the multi operated, ' +
      'if the intersection is partially changed despite the rest all unchanged',
    () => {
      const store = new StatofuStoreImpl();
      const [a1, b1, c1] = store.operate(
        [$a, $b, $c, $d],
        [{ a: 'a+' }, { b: 'b+' }, { c: 'c+' }, { d: 'd+' }]
      );

      const b2: B = { b: 'b++' };
      const listener = jest.fn((newStates, oldStates) => {
        expect(newStates).toBeArrayOfSize(3);
        expect(oldStates).toBeArrayOfSize(3);

        const [newA, newB, newC] = newStates;
        const [oldA, oldB, oldC] = oldStates;

        expect(newA).toBe(oldA);
        expect(newB).toBe(b2);
        expect(newC).toBe(oldC);

        expect(oldA).toBe(a1);
        expect(oldB).toBe(b1);
        expect(oldC).toBe(c1);
      });
      store.subscribe([$a, $b, $c], listener);
      store.operate([$b, $c, $d], ([, c, d]) => [b2, c, d]);
      expect(listener).toHaveBeenCalledOnce();
    }
  );
});

describe('a same listener subscribing same states changes many times only gets called once on the states changed', () => {
  test('in terms of any-state changes by one-state changes', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe(listener);
    store.subscribe(listener);
    store.operate($a, { a: 'a+' });
    expect(listener).toHaveBeenCalledOnce();
  });

  test('in terms of any-state changes by multi-state changes', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe(listener);
    store.subscribe(listener);
    store.operate([$a, $b], [{ a: 'a+' }, { b: 'b+' }]);
    expect(listener).toHaveBeenCalledOnce();
  });

  test('in terms of one-state changes', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe($a, listener);
    store.subscribe($a, listener);
    store.operate($a, { a: 'a+' });
    expect(listener).toHaveBeenCalledOnce();
  });

  test('in terms of multi-state changes', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe([$a, $b], listener);
    store.subscribe([$a, $b], listener);
    store.operate([$a, $b], [{ a: 'a+' }, { b: 'b+' }]);
    expect(listener).toHaveBeenCalledOnce();
  });
});

describe('each of different listeners subscribing same states changes gets called once on the states changed', () => {
  test('in terms of any-state changes by one-state changes', () => {
    const store = new StatofuStoreImpl();

    const listener1 = jest.fn();
    const listener2 = jest.fn();
    store.subscribe(listener1);
    store.subscribe(listener2);
    store.operate($a, { a: 'a+' });
    expect(listener1).toHaveBeenCalledOnce();
    expect(listener2).toHaveBeenCalledOnce();
  });

  test('in terms of any-state changes by multi-state changes', () => {
    const store = new StatofuStoreImpl();

    const listener1 = jest.fn();
    const listener2 = jest.fn();
    store.subscribe(listener1);
    store.subscribe(listener2);
    store.operate([$a, $b], [{ a: 'a+' }, { b: 'b+' }]);
    expect(listener1).toHaveBeenCalledOnce();
    expect(listener2).toHaveBeenCalledOnce();
  });

  test('in terms of one-state changes', () => {
    const store = new StatofuStoreImpl();

    const listener1 = jest.fn();
    const listener2 = jest.fn();
    store.subscribe($a, listener1);
    store.subscribe($a, listener2);
    store.operate($a, { a: 'a+' });
    expect(listener1).toHaveBeenCalledOnce();
    expect(listener2).toHaveBeenCalledOnce();
  });

  test('in terms of multi-state changes', () => {
    const store = new StatofuStoreImpl();

    const listener1 = jest.fn();
    const listener2 = jest.fn();
    store.subscribe([$a, $b], listener1);
    store.subscribe([$a, $b], listener2);
    store.operate([$a, $b], [{ a: 'a+' }, { b: 'b+' }]);
    expect(listener1).toHaveBeenCalledOnce();
    expect(listener2).toHaveBeenCalledOnce();
  });
});

describe('a listener subscribing states changes gets called as many times as the states changes happen', () => {
  test('in terms of any-state changes by one-state changes', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe(listener);
    store.operate($a, { a: 'a+' });
    store.operate($a, { a: 'a++' });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  test('in terms of any-state changes by multi-state changes', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe(listener);
    store.operate([$a, $b], [{ a: 'a+' }, { b: 'b+' }]);
    store.operate([$a, $b], [{ a: 'a++' }, { b: 'b++' }]);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  test('in terms of one-state changes', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe($a, listener);
    store.operate($a, { a: 'a+' });
    store.operate($a, { a: 'a++' });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  test('in terms of multi-state changes', () => {
    const store = new StatofuStoreImpl();

    const listener = jest.fn();
    store.subscribe([$a, $b], listener);
    store.operate([$a, $b], [{ a: 'a+' }, { b: 'b+' }]);
    store.operate([$a, $b], [{ a: 'a++' }, { b: 'b++' }]);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});

describe('coexisting listeners on different states changes only get called on their own subscribed changed', () => {
  test(
    'on one state changed, ' +
      '(1) one-state change listeners on the one, ' +
      '(2) any-state change listeners and ' +
      '(3) multi-state change listeners on some multi containing the one get called, ' +
      'but (1) one-state change listeners on other one and ' +
      '(2) multi-state change listeners on some multi not containing the one are not called',
    () => {
      const store = new StatofuStoreImpl();

      const oneStateChangeListeners = {
        onTheOne: jest.fn(),
        onOtherOne: jest.fn(),
      };
      const anyStateChangeListener = jest.fn();
      const multiStateChangeListeners = {
        onSomeMultiContainingTheOne: jest.fn(),
        onSomeMultiNotContainingTheOne: jest.fn(),
      };
      store.subscribe($a, oneStateChangeListeners.onTheOne);
      store.subscribe(anyStateChangeListener);
      store.subscribe([$a, $b], multiStateChangeListeners.onSomeMultiContainingTheOne);

      store.subscribe($b, oneStateChangeListeners.onOtherOne);
      store.subscribe([$b, $c], multiStateChangeListeners.onSomeMultiNotContainingTheOne);

      store.operate($a, { a: 'a+' });

      expect(oneStateChangeListeners.onTheOne).toHaveBeenCalledOnce();
      expect(anyStateChangeListener).toHaveBeenCalledOnce();
      expect(multiStateChangeListeners.onSomeMultiContainingTheOne).toHaveBeenCalledOnce();

      expect(oneStateChangeListeners.onOtherOne).not.toHaveBeenCalled();
      expect(multiStateChangeListeners.onSomeMultiNotContainingTheOne).not.toHaveBeenCalled();
    }
  );

  test(
    'on multi states operated but partially changed, ' +
      '(1) multi-state change listeners on the multi, ' +
      '(2) multi-state change listeners on other multi intersecting with the changed in the multi, ' +
      '(3) any-state change listeners and ' +
      '(4) one-state change listeners on some one contained by the changed in the multi get called, ' +
      'but (1) multi-state change listeners on other multi only intersecting with the unchanged in the multi, ' +
      '(2) multi-state change listeners on other multi not intersecting with the multi, ' +
      '(3) one-state change listeners on some one only contained by the unchanged in the multi are not called' +
      '(4) one-state change listeners on some one not contained by the multi are not called',
    () => {
      const store = new StatofuStoreImpl();

      const multiStateChangeListeners = {
        onTheMulti: jest.fn(),
        onOtherMultiIntersectingWithTheChangedInTheMulti: jest.fn(),
        onOtherMultiOnlyIntersectingWithTheUnchangedInTheMulti: jest.fn(),
        onOtherMultiNotIntersectingWithTheMulti: jest.fn(),
      };
      const anyStateChangeListener = jest.fn();
      const oneStateChangeListeners = {
        onSomeOneContainedByTheChangedInTheMulti: jest.fn(),
        onSomeOneOnlyContainedByTheUnhangedInTheMulti: jest.fn(),
        onSomeOneNotContainedByTheChangedInTheMulti: jest.fn(),
      };

      store.subscribe([$a, $b, $c], multiStateChangeListeners.onTheMulti);
      store.subscribe(
        [$c, $d],
        multiStateChangeListeners.onOtherMultiIntersectingWithTheChangedInTheMulti
      );
      store.subscribe(anyStateChangeListener);
      store.subscribe($b, oneStateChangeListeners.onSomeOneContainedByTheChangedInTheMulti);

      store.subscribe(
        [$a, $d],
        multiStateChangeListeners.onOtherMultiOnlyIntersectingWithTheUnchangedInTheMulti
      );
      store.subscribe([$d, $e], multiStateChangeListeners.onOtherMultiNotIntersectingWithTheMulti);
      store.subscribe($a, oneStateChangeListeners.onSomeOneOnlyContainedByTheUnhangedInTheMulti);
      store.subscribe($d, oneStateChangeListeners.onSomeOneNotContainedByTheChangedInTheMulti);

      store.operate([$a, $b, $c], ([a]) => [a, { b: 'b+' }, { c: 'c+' }]);

      expect(multiStateChangeListeners.onTheMulti).toHaveBeenCalledOnce();
      expect(
        multiStateChangeListeners.onOtherMultiIntersectingWithTheChangedInTheMulti
      ).toHaveBeenCalledOnce();
      expect(anyStateChangeListener).toHaveBeenCalledOnce();
      expect(
        oneStateChangeListeners.onSomeOneContainedByTheChangedInTheMulti
      ).toHaveBeenCalledOnce();

      expect(
        multiStateChangeListeners.onOtherMultiOnlyIntersectingWithTheUnchangedInTheMulti
      ).not.toHaveBeenCalled();
      expect(
        multiStateChangeListeners.onOtherMultiNotIntersectingWithTheMulti
      ).not.toHaveBeenCalled();
      expect(
        oneStateChangeListeners.onSomeOneOnlyContainedByTheUnhangedInTheMulti
      ).not.toHaveBeenCalled();
      expect(
        oneStateChangeListeners.onSomeOneNotContainedByTheChangedInTheMulti
      ).not.toHaveBeenCalled();
    }
  );
});

test('subscribing a tuple of $states containing ref-identical $states, an error of invalid states is thrown', () => {
  const store = new StatofuStoreImpl();

  expect(() => store.subscribe([$a, $a, $b], () => {})).toThrow(ERR_MSG_INVALID_STATES);
});

test(
  'calling _notifyStatesChangeListeners with a tuple of $states containing ref-identical $states, ' +
    'an error of invalid states is thrown',
  () => {
    const store = new StatofuStoreImpl();

    expect(() =>
      store._notifyStatesChangeListeners(
        [$a, $a, $b],
        [{ a: 'a+' }, { a: 'a++' }, { b: 'b+' }],
        [{ a: 'a+++' }, { a: 'a++++' }, { b: 'b++' }]
      )
    ).toThrow(ERR_MSG_INVALID_STATES);
  }
);
