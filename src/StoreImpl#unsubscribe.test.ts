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

test(
  'unsubscribing all, ' +
    'all any-state change listeners, ' +
    'all one-state change listeners and ' +
    'all multi-state change listeners go deactivated',
  () => {
    const store = new StatofuStoreImpl();

    const anyStateChangeListeners = { 1: jest.fn(), 2: jest.fn() };
    const oneStateChangeListeners = { 1: jest.fn(), 2: jest.fn() };
    const multiStateChangeListeners = { 1: jest.fn(), 2: jest.fn() };
    store.subscribe(anyStateChangeListeners[1]);
    store.subscribe(anyStateChangeListeners[2]);
    store.subscribe($a, oneStateChangeListeners[1]);
    store.subscribe($a, oneStateChangeListeners[2]);
    store.subscribe([$b, $c], multiStateChangeListeners[1]);
    store.subscribe([$b, $c], multiStateChangeListeners[2]);

    store.operate([$a, $b, $c], [{ a: 'a+' }, { b: 'b+' }, { c: 'c+' }]);
    [
      ...Object.values(anyStateChangeListeners),
      ...Object.values(oneStateChangeListeners),
      ...Object.values(multiStateChangeListeners),
    ].forEach((l) => expect(l).toHaveBeenCalledOnce());
    jest.clearAllMocks();

    store.unsubscribe();

    store.operate([$a, $b, $c], [{ a: 'a++' }, { b: 'b++' }, { c: 'c++' }]);
    [
      ...Object.values(anyStateChangeListeners),
      ...Object.values(oneStateChangeListeners),
      ...Object.values(multiStateChangeListeners),
    ].forEach((l) => expect(l).not.toHaveBeenCalled());
  }
);

test(
  'unsubscribing an any-state change listener, only the listener goes deactivated, ' +
    'but other any-state change listeners, ' +
    'all one-state change listeners and ' +
    'all multi-state change listeners stay activated',
  () => {
    const store = new StatofuStoreImpl();

    const anyStateChangeListeners = {
      specified: jest.fn(),
      other: jest.fn(),
    };
    const oneStateChangeListeners = { 1: jest.fn(), 2: jest.fn() };
    const multiStateChangeListeners = { 1: jest.fn(), 2: jest.fn() };
    store.subscribe(anyStateChangeListeners.specified);
    store.subscribe(anyStateChangeListeners.other);
    store.subscribe($a, oneStateChangeListeners[1]);
    store.subscribe($a, oneStateChangeListeners[2]);
    store.subscribe([$b, $c], multiStateChangeListeners[1]);
    store.subscribe([$b, $c], multiStateChangeListeners[2]);

    store.operate([$a, $b, $c], [{ a: 'a+' }, { b: 'b+' }, { c: 'c+' }]);
    [
      ...Object.values(anyStateChangeListeners),
      ...Object.values(oneStateChangeListeners),
      ...Object.values(multiStateChangeListeners),
    ].forEach((l) => expect(l).toHaveBeenCalledOnce());
    jest.clearAllMocks();

    store.unsubscribe(anyStateChangeListeners.specified);

    store.operate([$a, $b, $c], [{ a: 'a++' }, { b: 'b++' }, { c: 'c++' }]);
    expect(anyStateChangeListeners.specified).not.toHaveBeenCalled();
    expect(anyStateChangeListeners.other).toHaveBeenCalledOnce();
    [
      ...Object.values(oneStateChangeListeners),
      ...Object.values(multiStateChangeListeners),
    ].forEach((l) => expect(l).toHaveBeenCalledOnce());
  }
);

describe('unsubscribing one-state changes', () => {
  test(
    'on no listener specified, all one-state change listeners on the one go deactivated, ' +
      'but one-state change listeners on other one, ' +
      'any-state change listeners, ' +
      'multi-state change listeners on some multi ' +
      'either containing or not containing the one stay activated',
    () => {
      const store = new StatofuStoreImpl();

      const oneStateChangeListeners = {
        onTheOne1: jest.fn(),
        onTheOne2: jest.fn(),
        onOtherOne: jest.fn(),
      };
      const anyStateChangeListener = jest.fn();
      const multiStateChangeListeners = {
        onSomeMultiContainingTheOne: jest.fn(),
        onSomeMultiNotContainingTheOne: jest.fn(),
      };
      store.subscribe($a, oneStateChangeListeners.onTheOne1);
      store.subscribe($a, oneStateChangeListeners.onTheOne2);
      store.subscribe($b, oneStateChangeListeners.onOtherOne);
      store.subscribe(anyStateChangeListener);
      store.subscribe([$a, $b], multiStateChangeListeners.onSomeMultiContainingTheOne);
      store.subscribe([$b, $c], multiStateChangeListeners.onSomeMultiNotContainingTheOne);

      store.operate([$a, $b, $c], [{ a: 'a+' }, { b: 'b+' }, { c: 'c+' }]);
      [
        ...Object.values(oneStateChangeListeners),
        anyStateChangeListener,
        ...Object.values(multiStateChangeListeners),
      ].forEach((l) => expect(l).toHaveBeenCalledOnce());
      jest.clearAllMocks();

      store.unsubscribe($a);

      store.operate([$a, $b, $c], [{ a: 'a++' }, { b: 'b++' }, { c: 'c++' }]);
      expect(oneStateChangeListeners.onTheOne1).not.toHaveBeenCalled();
      expect(oneStateChangeListeners.onTheOne2).not.toHaveBeenCalled();
      expect(oneStateChangeListeners.onOtherOne).toHaveBeenCalledOnce();
      expect(anyStateChangeListener).toHaveBeenCalledOnce();
      expect(multiStateChangeListeners.onSomeMultiContainingTheOne).toHaveBeenCalledOnce();
      expect(multiStateChangeListeners.onSomeMultiNotContainingTheOne).toHaveBeenCalledOnce();
    }
  );

  test(
    'on a listener specified, only the listener on the one goes deactivated, ' +
      'but other one-state change listeners on the one, ' +
      'one-state change listeners on other one, ' +
      'any-state change listeners, ' +
      'multi-state change listeners on some multi ' +
      'either containing or not containing the one stay activated',
    () => {
      const store = new StatofuStoreImpl();

      const oneStateChangeListeners = {
        specifiedOnTheOne: jest.fn(),
        otherOnTheOne: jest.fn(),
        onOtherOne: jest.fn(),
      };
      const anyStateChangeListener = jest.fn();
      const multiStateChangeListeners = {
        onSomeMultiContainingTheOne: jest.fn(),
        onSomeMultiNotContainingTheOne: jest.fn(),
      };
      store.subscribe($a, oneStateChangeListeners.specifiedOnTheOne);
      store.subscribe($a, oneStateChangeListeners.otherOnTheOne);
      store.subscribe($b, oneStateChangeListeners.onOtherOne);
      store.subscribe(anyStateChangeListener);
      store.subscribe([$a, $b], multiStateChangeListeners.onSomeMultiContainingTheOne);
      store.subscribe([$b, $c], multiStateChangeListeners.onSomeMultiNotContainingTheOne);

      store.operate([$a, $b, $c], [{ a: 'a+' }, { b: 'b+' }, { c: 'c+' }]);
      [
        ...Object.values(oneStateChangeListeners),
        anyStateChangeListener,
        ...Object.values(multiStateChangeListeners),
      ].forEach((l) => expect(l).toHaveBeenCalledOnce());
      jest.clearAllMocks();

      store.unsubscribe($a, oneStateChangeListeners.specifiedOnTheOne);

      store.operate([$a, $b, $c], [{ a: 'a++' }, { b: 'b++' }, { c: 'c++' }]);
      expect(oneStateChangeListeners.specifiedOnTheOne).not.toHaveBeenCalled();
      expect(oneStateChangeListeners.otherOnTheOne).toHaveBeenCalledOnce();
      expect(oneStateChangeListeners.onOtherOne).toHaveBeenCalledOnce();
      expect(anyStateChangeListener).toHaveBeenCalledOnce();
      expect(multiStateChangeListeners.onSomeMultiContainingTheOne).toHaveBeenCalledOnce();
      expect(multiStateChangeListeners.onSomeMultiNotContainingTheOne).toHaveBeenCalledOnce();
    }
  );
});

describe('unsubscribing multi-state changes', () => {
  test(
    'on no listener specified, all multi-state change listeners on the multi go deactivated, ' +
      'but multi-state change listeners on other multi ' +
      'either intersecting with or not intersecting with the multi, ' +
      'any-state change listeners and ' +
      'one-state change listeners on some one ' +
      'either contained by or not contained by the multi stay activated',
    () => {
      const store = new StatofuStoreImpl();

      const multiStateChangeListeners = {
        onTheMulti1: jest.fn(),
        onTheMulti2: jest.fn(),
        onOtherMultiIntersectingWithTheMulti: jest.fn(),
        onOtherMultiNotIntersectingWithTheMulti: jest.fn(),
      };
      const anyStateChangeListener = jest.fn();
      const oneStateChangeListeners = {
        onSomeOneContainedByTheMulti: jest.fn(),
        onSomeOneNotContainedByTheMulti: jest.fn(),
      };
      store.subscribe([$a, $b, $c], multiStateChangeListeners.onTheMulti1);
      store.subscribe([$a, $b, $c], multiStateChangeListeners.onTheMulti2);
      store.subscribe([$c, $d], multiStateChangeListeners.onOtherMultiIntersectingWithTheMulti);
      store.subscribe([$d, $e], multiStateChangeListeners.onOtherMultiNotIntersectingWithTheMulti);
      store.subscribe(anyStateChangeListener);
      store.subscribe($a, oneStateChangeListeners.onSomeOneContainedByTheMulti);
      store.subscribe($d, oneStateChangeListeners.onSomeOneNotContainedByTheMulti);

      store.operate(
        [$a, $b, $c, $d, $e],
        [{ a: 'a+' }, { b: 'b+' }, { c: 'c+' }, { d: 'd+' }, { e: 'e+' }]
      );
      [
        ...Object.values(multiStateChangeListeners),
        anyStateChangeListener,
        ...Object.values(oneStateChangeListeners),
      ].forEach((l) => expect(l).toHaveBeenCalledOnce());
      jest.clearAllMocks();

      store.unsubscribe([$a, $b, $c]);

      store.operate(
        [$a, $b, $c, $d, $e],
        [{ a: 'a++' }, { b: 'b++' }, { c: 'c++' }, { d: 'd++' }, { e: 'e++' }]
      );
      expect(multiStateChangeListeners.onTheMulti1).not.toHaveBeenCalled();
      expect(multiStateChangeListeners.onTheMulti2).not.toHaveBeenCalled();
      expect(multiStateChangeListeners.onOtherMultiIntersectingWithTheMulti).toHaveBeenCalledOnce();
      expect(
        multiStateChangeListeners.onOtherMultiNotIntersectingWithTheMulti
      ).toHaveBeenCalledOnce();
      expect(anyStateChangeListener).toHaveBeenCalledOnce();
      expect(oneStateChangeListeners.onSomeOneContainedByTheMulti).toHaveBeenCalledOnce();
      expect(oneStateChangeListeners.onSomeOneNotContainedByTheMulti).toHaveBeenCalledOnce();
    }
  );

  test(
    'on a listener specified, only the listener on the multi goes deactivated, ' +
      'but other multi-state change listeners on the multi, ' +
      'multi-state change listeners on other multi ' +
      'either intersecting with or not intersecting with the multi, ' +
      'any-state change listeners and' +
      'one-state change listeners on some one ' +
      'either contained by or not contained by the multi stay activated',
    () => {
      const store = new StatofuStoreImpl();

      const multiStateChangeListeners = {
        specifiedOnTheMulti: jest.fn(),
        otherOnTheMulti: jest.fn(),
        onOtherMultiIntersectingWithTheMulti: jest.fn(),
        onOtherMultiNotIntersectingWithTheMulti: jest.fn(),
      };
      const anyStateChangeListener = jest.fn();
      const oneStateChangeListeners = {
        onSomeOneContainedByTheMulti: jest.fn(),
        onSomeOneNotContainedByTheMulti: jest.fn(),
      };
      store.subscribe([$a, $b, $c], multiStateChangeListeners.specifiedOnTheMulti);
      store.subscribe([$a, $b, $c], multiStateChangeListeners.otherOnTheMulti);
      store.subscribe([$c, $d], multiStateChangeListeners.onOtherMultiIntersectingWithTheMulti);
      store.subscribe([$d, $e], multiStateChangeListeners.onOtherMultiNotIntersectingWithTheMulti);
      store.subscribe(anyStateChangeListener);
      store.subscribe($a, oneStateChangeListeners.onSomeOneContainedByTheMulti);
      store.subscribe($d, oneStateChangeListeners.onSomeOneNotContainedByTheMulti);

      store.operate(
        [$a, $b, $c, $d, $e],
        [{ a: 'a+' }, { b: 'b+' }, { c: 'c+' }, { d: 'd+' }, { e: 'e+' }]
      );
      [
        ...Object.values(multiStateChangeListeners),
        anyStateChangeListener,
        ...Object.values(oneStateChangeListeners),
      ].forEach((l) => expect(l).toHaveBeenCalledOnce());
      jest.clearAllMocks();

      store.unsubscribe([$a, $b, $c], multiStateChangeListeners.specifiedOnTheMulti);

      store.operate(
        [$a, $b, $c, $d, $e],
        [{ a: 'a++' }, { b: 'b++' }, { c: 'c++' }, { d: 'd++' }, { e: 'e++' }]
      );
      expect(multiStateChangeListeners.specifiedOnTheMulti).not.toHaveBeenCalled();
      expect(multiStateChangeListeners.otherOnTheMulti).toHaveBeenCalledOnce();
      expect(multiStateChangeListeners.onOtherMultiIntersectingWithTheMulti).toHaveBeenCalledOnce();
      expect(
        multiStateChangeListeners.onOtherMultiNotIntersectingWithTheMulti
      ).toHaveBeenCalledOnce();
      expect(anyStateChangeListener).toHaveBeenCalledOnce();
      expect(oneStateChangeListeners.onSomeOneContainedByTheMulti).toHaveBeenCalledOnce();
      expect(oneStateChangeListeners.onSomeOneNotContainedByTheMulti).toHaveBeenCalledOnce();
    }
  );
});

test(
  'using the callback from any-state changes subscribing, ' +
    'any-state changes unsubscribing is called under the hood',
  () => {
    const store = new StatofuStoreImpl();

    const anyStateChangeListener = () => {};
    const unsubscribe = jest.fn((listener) => {
      expect(listener).toBe(anyStateChangeListener);
    });
    Object.assign(store, { unsubscribe });

    const unsubscribeAny = store.subscribe(anyStateChangeListener);
    unsubscribeAny();
    expect(unsubscribe).toHaveBeenCalledOnce();
  }
);

test(
  'using the callback from one-state changes subscribing, ' +
    'one-state changes unsubscribing is called under the hood',
  () => {
    const store = new StatofuStoreImpl();

    const oneStateChangeListener = () => {};
    const unsubscribe = jest.fn(($state, listener) => {
      expect($state).toBe($a);
      expect(listener).toBe(oneStateChangeListener);
    });
    Object.assign(store, { unsubscribe });

    const unsubscribeOne = store.subscribe($a, oneStateChangeListener);
    unsubscribeOne();
    expect(unsubscribe).toHaveBeenCalledOnce();
  }
);

test(
  'using the callback from multi-state changes subscribing, ' +
    'multi-state changes unsubscribing is called under the hood',
  () => {
    const store = new StatofuStoreImpl();

    const multiStateChangeListener = () => {};
    const unsubscribe = jest.fn(($states, listener) => {
      expect($states).toBeArrayOfSize(2);
      expect($states[0]).toBe($a);
      expect($states[1]).toBe($b);
      expect(listener).toBe(multiStateChangeListener);
    });
    Object.assign(store, { unsubscribe });

    const unsubscribeMulti = store.subscribe([$a, $b], multiStateChangeListener);
    unsubscribeMulti();
    expect(unsubscribe).toHaveBeenCalledOnce();
  }
);

describe(
  'after unsubscribing all any-state changes listener by listener, ' +
    'another listener subscribing any-state changes can be called on ...',
  () => {
    test('on one state operated and changed', () => {
      const store = new StatofuStoreImpl();

      const listener1 = () => {};
      store.subscribe(listener1);
      store.unsubscribe(listener1);

      const listener2 = jest.fn();
      store.subscribe(listener2);
      store.operate($a, { a: 'a+' });
      expect(listener2).toHaveBeenCalledOnce();
    });

    test('on multi states operated and partially changed', () => {
      const store = new StatofuStoreImpl();

      const listener1 = () => {};
      store.subscribe(listener1);
      store.unsubscribe(listener1);

      const listener2 = jest.fn();
      store.subscribe(listener2);
      store.operate([$a, $b], ([, b]) => [{ a: 'a+' }, b]);
      expect(listener2).toHaveBeenCalledOnce();
    });
  }
);

test(
  'after unsubscribing all one-state changes listener by listener, ' +
    'another listener subscribing one-state changes can be called on the one operated and changed',
  () => {
    const store = new StatofuStoreImpl();

    const listener1 = () => {};
    store.subscribe($a, listener1);
    store.unsubscribe($a, listener1);

    const listener2 = jest.fn();
    store.subscribe(listener2);
    store.operate($a, { a: 'a+' });
    expect(listener2).toHaveBeenCalledOnce();
  }
);

test(
  'after unsubscribing all multi-state changes listener by listener, ' +
    'another listener subscribing multi-state changes can be called on the multi operated and partially changed',
  () => {
    const store = new StatofuStoreImpl();

    const listener1 = () => {};
    store.subscribe([$a, $b], listener1);
    store.unsubscribe([$a, $b], listener1);

    const listener2 = jest.fn();
    store.subscribe(listener2);
    store.operate([$a, $b], ([, b]) => [{ a: 'a+' }, b]);
    expect(listener2).toHaveBeenCalledOnce();
  }
);

test('unsubscribing a tuple of $states containing ref-identical $states, an error of invalid states is thrown', () => {
  const store = new StatofuStoreImpl();

  expect(() => store.unsubscribe([$a, $a, $b], () => {})).toThrow(ERR_MSG_INVALID_STATES);
});
