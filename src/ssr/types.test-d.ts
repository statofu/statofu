import type { StatofuSsrStateFolder } from './types';

const someStr: string = '';

interface A {
  a: string;
}

const $a: A = { a: someStr };

interface B {
  b: string;
}

const $b: B = { b: someStr };

(function _test_states() {
  function assignStateFolder(stateFolder: StatofuSsrStateFolder) {}

  // @ts-expect-error
  assignStateFolder($a);

  // @ts-expect-error
  assignStateFolder([]);

  // @ts-expect-error
  assignStateFolder('');

  // @ts-expect-error
  assignStateFolder(1);

  assignStateFolder({});

  assignStateFolder({ $a });

  assignStateFolder({ ['keyA']: $a });

  assignStateFolder({ [1]: $a });

  assignStateFolder({ $a, $b });
})();
