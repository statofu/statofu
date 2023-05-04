const { createStatofuStore } = require('statofu');

require('./appLogics');

const store = createStatofuStore();

appLogics.test(store, (a) => {
  console.log(JSON.stringify(a));
});
