import { expectType } from 'tsd';

import type {
  Multi,
  OneOrMulti,
  StatofuOperate,
  StatofuSnapshot,
  StatofuState,
  StatofuSubscribe,
} from './types';

const someStr: string = '';
const someNum: number = 0;

interface A {
  a: string;
}

const $a: A = { a: someStr };

interface B {
  b: string;
}

const $b: B = { b: someStr };

(function _test_one_state() {
  function assignOneState(one: StatofuState) {}

  const a1: A = { a: someStr };

  assignOneState(a1);

  // @ts-expect-error
  assignOneState(someStr);

  // @ts-expect-error
  assignOneState(someNum);

  // @ts-expect-error
  assignOneState(true);

  // @ts-expect-error
  assignOneState(null);

  // @ts-expect-error
  assignOneState(undefined);

  // @ts-expect-error
  assignOneState(Symbol());

  // @ts-expect-error
  assignOneState([]);
})();

(function _test_multi_state() {
  function assignMultiStates(multi: Multi<StatofuState>) {}

  const a1: A = { a: someStr };
  const b1: B = { b: someStr };

  // @ts-expect-error
  assignMultiStates([]);

  assignMultiStates([a1]);

  // @ts-expect-error
  assignMultiStates([someStr]);

  // @ts-expect-error
  assignMultiStates([someNum]);

  // @ts-expect-error
  assignMultiStates([true]);

  // @ts-expect-error
  assignMultiStates([null]);

  // @ts-expect-error
  assignMultiStates([undefined]);

  // @ts-expect-error
  assignMultiStates([Symbol()]);

  // @ts-expect-error
  assignMultiStates([[]]);

  assignMultiStates([a1, b1]);

  // @ts-expect-error
  assignMultiStates([a1, someStr]);

  // @ts-expect-error
  assignMultiStates([a1, someNum]);

  // @ts-expect-error
  assignMultiStates([a1, true]);

  // @ts-expect-error
  assignMultiStates([a1, null]);

  // @ts-expect-error
  assignMultiStates([a1, undefined]);

  // @ts-expect-error
  assignMultiStates([a1, Symbol()]);

  // @ts-expect-error
  assignMultiStates([a1, []]);
})();

(function _test_snapshot() {
  const snapshot: StatofuSnapshot = () => {};

  expectType<A>(snapshot($a));
  expectType<[A]>(snapshot([$a]));
  expectType<[A, B]>(snapshot([$a, $b]));

  expectType<string>(snapshot($a, () => someStr));
  expectType<string>(snapshot([$a], () => someStr));
  expectType<string>(snapshot([$a, $b], () => someStr));

  expectType<A>(snapshot($a, () => ({ a: someStr })));
  expectType<[A]>(snapshot([$a], () => [{ a: someStr }]));
  expectType<[A, B]>(snapshot([$a, $b], () => [{ a: someStr }, { b: someStr }]));

  expectType<A>(
    snapshot($a, (a) => {
      expectType<A>(a);
      return a;
    })
  );
  expectType<[A]>(
    snapshot([$a], ([a]) => {
      expectType<A>(a);
      return [a];
    })
  );
  expectType<[A, B]>(
    snapshot([$a, $b], ([a, b]) => {
      expectType<A>(a);
      expectType<B>(b);
      return [a, b];
    })
  );

  expectType<string>(
    snapshot($a, (a) => {
      expectType<A>(a);
      return a.a;
    })
  );
  expectType<string>(
    snapshot([$a], ([a]) => {
      return a.a;
    })
  );
  expectType<string>(
    snapshot([$a, $b], ([a, b]) => {
      expectType<A>(a);
      expectType<B>(b);
      return a.a + b.b;
    })
  );

  snapshot(
    $a,
    (a, p1, p2) => {
      expectType<A>(a);
      expectType<string>(p1);
      expectType<number>(p2);
    },
    someStr,
    someNum
  );
  snapshot(
    [$a, $b],
    ([a, b], p1, p2) => {
      expectType<A>(a);
      expectType<B>(b);
      expectType<string>(p1);
      expectType<number>(p2);
    },
    someStr,
    someNum
  );
})();

(function _test_operate() {
  const operate: StatofuOperate = () => {};

  expectType<A>(operate($a, { a: someStr }));
  expectType<[A]>(operate([$a], [{ a: someStr }]));
  expectType<[A, B]>(operate([$a, $b], [{ a: someStr }, { b: someStr }]));

  expectType<A>(operate($a, () => ({ a: someStr })));
  expectType<[A]>(operate([$a], () => [{ a: someStr }]));
  expectType<[A, B]>(operate([$a, $b], () => [{ a: someStr }, { b: someStr }]));

  expectType<A>(
    operate($a, (a) => {
      expectType<A>(a);
      return a;
    })
  );
  expectType<[A]>(
    operate([$a], ([a]) => {
      expectType<A>(a);
      return [a];
    })
  );
  expectType<[A, B]>(
    operate([$a, $b], ([a, b]) => {
      expectType<A>(a);
      expectType<B>(b);
      return [a, b];
    })
  );

  operate(
    $a,
    (a, p1, p2) => {
      expectType<A>(a);
      expectType<string>(p1);
      expectType<number>(p2);
      return a;
    },
    someStr,
    someNum
  );
  operate(
    [$a],
    ([a], p1, p2) => {
      expectType<A>(a);
      expectType<string>(p1);
      expectType<number>(p2);
      return [a];
    },
    someStr,
    someNum
  );
  operate(
    [$a, $b],
    ([a, b], p1, p2) => {
      expectType<A>(a);
      expectType<B>(b);
      expectType<string>(p1);
      expectType<number>(p2);
      return [a, b];
    },
    someStr,
    someNum
  );
})();

(function _test_subscribe() {
  const subscribe: StatofuSubscribe = () => undo;
  const undo = () => {};

  expectType<typeof undo>(
    subscribe((newStates, oldStates) => {
      expectType<OneOrMulti<StatofuState>>(newStates);
      expectType<OneOrMulti<StatofuState>>(oldStates);
    })
  );

  expectType<typeof undo>(
    subscribe($a, (newA, oldA) => {
      expectType<A>(newA);
      expectType<A>(oldA);
    })
  );

  expectType<typeof undo>(
    subscribe([$a], ([newA], [oldA]) => {
      expectType<A>(newA);
      expectType<A>(oldA);
    })
  );

  expectType<typeof undo>(
    subscribe([$a, $b], ([newA, newB], [oldA, oldB]) => {
      expectType<A>(newA);
      expectType<B>(newB);
      expectType<A>(oldA);
      expectType<B>(oldB);
    })
  );
})();
