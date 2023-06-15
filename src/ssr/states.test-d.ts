import { expectType } from 'tsd';

import { createStatofuStore } from '..';
import { foldStates, unfoldStates } from './states';

const store = createStatofuStore();

const someStr: string = '';

interface A {
  a: string;
}

const $a: A = { a: someStr };

interface B {
  b: string;
}

const $b: B = { b: someStr };

(function _test_foldStates() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  expectType<{}>(foldStates(store, {}));

  expectType<{ $a: A }>(foldStates(store, { $a }));

  expectType<{ ['keyA']: A }>(foldStates(store, { ['keyA']: $a }));

  expectType<{ [1]: A }>(foldStates(store, { [1]: $a }));

  expectType<{ $a: A; $b: B }>(foldStates(store, { $a, $b }));
})();

(function _test_unfoldStates() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  expectType<{}>(unfoldStates(store, {}, {}));

  expectType<{
    $a: A;
  }>(unfoldStates(store, { $a }, { $a: { a: someStr } }));

  expectType<{
    ['keyA']: A;
  }>(unfoldStates(store, { ['keyA']: $a }, { ['keyA']: { a: someStr } }));

  expectType<{
    [1]: A;
  }>(unfoldStates(store, { [1]: $a }, { [1]: { a: someStr } }));

  expectType<{
    $a: A;
    $b: B;
  }>(unfoldStates(store, { $a, $b }, { $a: { a: someStr }, $b: { b: someStr } }));
})();
