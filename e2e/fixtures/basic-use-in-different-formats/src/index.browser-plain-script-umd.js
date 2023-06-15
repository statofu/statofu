const { createStatofuStore } = statofu;
const { foldStates, unfoldStates } = statofuSsr;

const elRoot = document.querySelector('#root');

if (!elRoot) {
  throw new Error('Root element not found');
}

const store = createStatofuStore();

appLogics.testCore(store, (o) => {
  elRoot.innerHTML += JSON.stringify(o) + '<br/>';
});

appLogics.testSsr(store, { foldStates, unfoldStates }, (o) => {
  elRoot.innerHTML += JSON.stringify(o) + '<br/>';
});
