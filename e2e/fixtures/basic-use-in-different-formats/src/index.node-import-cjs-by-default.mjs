import { createStatofuStore } from 'statofu';
import { foldStates, unfoldStates } from 'statofu/ssr';

import './appLogics.js';

const store = createStatofuStore();

appLogics.testCore(store, (o) => {
  console.log(JSON.stringify(o));
});

appLogics.testSsr(store, { foldStates, unfoldStates }, (o) => {
  console.log(JSON.stringify(o));
});
