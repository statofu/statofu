import { createStatofuStore } from 'statofu/cjs';
import { foldStates, unfoldStates } from 'statofu/ssr/cjs';

import './appLogics';

const elRoot = document.getElementById('root');

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
