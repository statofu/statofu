const { createStatofuStore } = require('statofu');
const { foldStates, unfoldStates } = require('statofu/ssr');

require('./appLogics');

const store = createStatofuStore();

appLogics.testCore(store, (o) => {
  console.log(JSON.stringify(o));
});

appLogics.testSsr(store, { foldStates, unfoldStates }, (o) => {
  console.log(JSON.stringify(o));
});
