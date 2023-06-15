import { createStatofuStore } from '../createStore';
import { foldStates, unfoldStates } from './states';

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

describe('foldStates', () => {
  test('returns a state folder in the given form, mapping each $state to the state value', () => {
    const store = createStatofuStore();
    const a1: A = { a: 'a+' };
    store.operate($a, a1);

    expect(foldStates(store, { $a, $b, ['keyC']: $c })).toStrictEqual({
      $a: a1,
      $b,
      ['keyC']: $c,
    });
  });
});

describe('unfoldStates', () => {
  test(
    'sets each state value in the state folder ' +
      'to the $state that is indexed by the same key in the form, and' +
      'returns the state folder',
    () => {
      const store = createStatofuStore();
      const a1: A = { a: 'a+' };
      const b1: B = { b: 'b+' };

      expect(unfoldStates(store, { $a, ['keyB']: $b }, { $a: a1, ['keyB']: b1 })).toStrictEqual({
        $a: a1,
        ['keyB']: b1,
      });

      expect(store.snapshot($a)).toBe(a1);
      expect(store.snapshot($b)).toBe(b1);
    }
  );
});
