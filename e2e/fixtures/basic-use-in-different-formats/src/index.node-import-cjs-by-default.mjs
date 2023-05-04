import { createStatofuStore } from 'statofu';

import './appLogics.js';

const store = createStatofuStore();

appLogics.test(store, (a) => {
  console.log(JSON.stringify(a));
});
