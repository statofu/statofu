import { createStatofuStore } from './createStore';

(function _test_access_to_members_of_store() {
  const store = createStatofuStore();

  store.snapshot;
  store.operate;
  store.subscribe;
  store.unsubscribe;
  store.clear;

  // @ts-expect-error
  store._getOneState;
  // @ts-expect-error
  store._getOneOrMultiStates;
  // @ts-expect-error
  store._setOneStateOnly;
  // @ts-expect-error
  store._setOneOrMultiStatesOnly;
  // @ts-expect-error
  store._notifyStatesChangeListeners;
})();
