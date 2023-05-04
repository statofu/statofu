const { createStatofuStore } = statofu;

const elRoot = document.querySelector('#root');

if (!elRoot) {
  throw new Error('Root element not found');
}

const store = createStatofuStore();

appLogics.test(store, (a) => {
  elRoot.innerHTML += JSON.stringify(a) + '<br/>';
});
