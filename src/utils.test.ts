import { areSameArrays, areValidMultiStates, isUniqueInArray, isValidOneState } from './utils';

const pojo1 = { pojo1: 'pojo1' };
const pojo2 = { pojo2: 'pojo2' };

describe('isValidOneState/areValidMultiStates', () => {
  test('a non-object is not one state', () => {
    expect(isValidOneState('string')).toBeFalse();
  });

  test('null is not one state', () => {
    expect(isValidOneState(null)).toBeFalse();
  });

  test('an array is not one state', () => {
    expect(isValidOneState([])).toBeFalse();
  });

  test('a POJO is one state', () => {
    expect(isValidOneState(pojo1)).toBeTrue();
  });

  test('a non-array is not multi states', () => {
    expect(areValidMultiStates('string')).toBeFalse();
  });

  test('an empty array is not multi states', () => {
    expect(areValidMultiStates([])).toBeFalse();
  });

  test('a non-empty array of POJOs is multi states', () => {
    expect(areValidMultiStates([pojo1, pojo2])).toBeTrue();
  });

  test('a non-empty array containing a non-POJO is not multi states', () => {
    expect(areValidMultiStates([pojo1, 'string'])).toBeFalse();
  });

  test('a non-empty array containing ref-identical POJOs is not multi states', () => {
    expect(areValidMultiStates([pojo1, pojo1, pojo2])).toBeFalse();
  });
});

describe('areSameArrays', () => {
  test('true if the 2 arrays are ref-identical', () => {
    const a = [1];
    expect(areSameArrays(a, a)).toBeTrue();
  });

  test('false if the 2 arrays have different length', () => {
    expect(areSameArrays([], [pojo1])).toBeFalse();
  });

  describe('if the 2 arrays are ref-different but have the same length', () => {
    test('true if the elements are ref-identical in the same order', () => {
      expect(areSameArrays([pojo1, pojo2], [pojo1, pojo2])).toBeTrue();
    });

    test('false if some of the elements are ref-different', () => {
      expect(areSameArrays([pojo1, pojo2], [{ ...pojo1 }, pojo2])).toBeFalse();
    });
  });
});

describe('isUniqueInArray', () => {
  test('true if the given element is ref-identical to only one ref-identical element in the given array', () => {
    expect(isUniqueInArray(pojo1, [pojo1, pojo2])).toBeTrue();
  });

  test('false if the given element is ref-identical to no element in the given array', () => {
    expect(isUniqueInArray(pojo1, [{ ...pojo1 }, pojo2])).toBeFalse();
  });

  test('false if the given element is ref-identical to more than one element in the given array', () => {
    expect(isUniqueInArray(pojo1, [pojo1, pojo1, pojo2])).toBeFalse();
  });
});
