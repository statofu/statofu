import { StatofuStoreImpl } from './StoreImpl';

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

test(
  'after clearing, ' +
    'all states go not-yet-saved and all listeners go deactivated, ' +
    'but the store still works in terms of snapshotting, operating, subscribing and unsubscribing',
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

    const [a1, b1, c1] = store.operate([$a, $b, $c], [{ a: 'a+' }, { b: 'b+' }, { c: 'c+' }]);
    const [a2, b2, c2] = store.snapshot([$a, $b, $c]);
    expect(a2).toBe(a1);
    expect(b2).toBe(b1);
    expect(c2).toBe(c1);
    [
      ...Object.values(anyStateChangeListeners),
      ...Object.values(oneStateChangeListeners),
      ...Object.values(multiStateChangeListeners),
    ].forEach((l) => expect(l).toHaveBeenCalledOnce());
    jest.clearAllMocks();

    // - - -

    store.clear();

    // - - -

    const [a3, b3, c3] = store.snapshot([$a, $b, $c]);
    expect(a3).not.toBe(a1);
    expect(a3).not.toBe($a);
    expect(a3).toStrictEqual($a);
    expect(b3).not.toBe(b1);
    expect(b3).not.toBe($b);
    expect(b3).toStrictEqual($b);
    expect(c3).not.toBe(c1);
    expect(c3).not.toBe($c);
    expect(c3).toStrictEqual($c);

    const [a4, b4, c4] = store.operate([$a, $b, $c], [{ a: 'a++' }, { b: 'b++' }, { c: 'c++' }]);
    [
      ...Object.values(anyStateChangeListeners),
      ...Object.values(oneStateChangeListeners),
      ...Object.values(multiStateChangeListeners),
    ].forEach((l) => expect(l).not.toHaveBeenCalled());
    jest.clearAllMocks();

    // - - -

    const [a5, b5, c5] = store.snapshot([$a, $b, $c]);
    expect(a5).toBe(a4);
    expect(b5).toBe(b4);
    expect(c5).toBe(c4);

    store.subscribe(anyStateChangeListeners[1]);
    store.subscribe(anyStateChangeListeners[2]);
    store.subscribe($a, oneStateChangeListeners[1]);
    store.subscribe($a, oneStateChangeListeners[2]);
    store.subscribe([$b, $c], multiStateChangeListeners[1]);
    store.subscribe([$b, $c], multiStateChangeListeners[2]);

    store.operate([$a, $b, $c], [{ a: 'a+++' }, { b: 'b+++' }, { c: 'c+++' }]);
    [
      ...Object.values(anyStateChangeListeners),
      ...Object.values(oneStateChangeListeners),
      ...Object.values(multiStateChangeListeners),
    ].forEach((l) => expect(l).toHaveBeenCalledOnce());
    jest.clearAllMocks();

    store.unsubscribe(anyStateChangeListeners[1]);
    store.unsubscribe($a, oneStateChangeListeners[1]);
    store.unsubscribe([$b, $c], multiStateChangeListeners[1]);

    store.operate([$a, $b, $c], [{ a: 'a+++' }, { b: 'b+++' }, { c: 'c+++' }]);
    expect(anyStateChangeListeners[1]).not.toHaveBeenCalled();
    expect(oneStateChangeListeners[1]).not.toHaveBeenCalled();
    expect(multiStateChangeListeners[1]).not.toHaveBeenCalled();
    expect(anyStateChangeListeners[2]).toHaveBeenCalledOnce();
    expect(oneStateChangeListeners[2]).toHaveBeenCalledOnce();
    expect(multiStateChangeListeners[2]).toHaveBeenCalledOnce();
  }
);
