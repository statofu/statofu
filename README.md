<h1 align="center">
  <img src="./assets/d9606fc3fb1f3abc2505a5856412c87b8cce3679.jpg" alt="Statofu" />
</h1>

[![Coverage](https://img.shields.io/codecov/c/github/statofu/statofu/latest)](https://codecov.io/gh/statofu/statofu)
[![Verify and release](https://img.shields.io/github/actions/workflow/status/statofu/statofu/verify-and-release.yml?branch=latest&label=verify%20and%20release)](https://github.com/statofu/statofu/actions/workflows/verify-and-release.yml)
[![Npm Version](https://img.shields.io/npm/v/statofu)](https://npmjs.com/package/statofu)
[![Minzipped size](https://img.shields.io/bundlephobia/minzip/statofu)](https://bundlephobia.com/package/statofu)
[![License](https://img.shields.io/github/license/statofu/statofu)](./LICENSE)

English | [中文](./README.zh-Hans.md)

## Why Statofu?

One big problem with today's widely accepted state management libraries is that predictable state changes have to come at a high cost. [A detailed article](https://github.com/statofu/statofu-blog/blob/main/20230525/README.en.md) was written for the explaination. Please check it out.

Thus, Statofu, another state management library, is built to achieve **predictable state changes at a low cost** 🌈. Besides, it's framework-agnostic, fast, and small.

## Installation

Statofu can be installed by `npm` or any preferred package manager:

```sh
npm i -S statofu
```

Or, the UMD format can be loaded directly from an npm CDN:

```html
<script src="https://unpkg.com/statofu/dist/statofu.umd.min.js"></script>
```

The UMD name is `statofu`.

## Essentials

### Creating a store

In Statofu, states are managed by a store. The API `createStatofuStore` creates a store:

```ts
import { createStatofuStore } from 'statofu';

const store = createStatofuStore();
```

### Defining states

A state in Statofu is defined by a Plain Old JavaScript Object(POJO). A POJO itself is not a state itself but a state definition, (1) hosting a default state value, (2) declaring the state type, and (3) identifying the state it defines:

```ts
interface CheckboxState {
  checked: boolean;
  highlighted: boolean;
}

const $checkboxState = {
  checked: false,
  highlighted: false,
};

interface TextareaState {
  text: string;
  highlighted: boolean;
}

const $textareaState = {
  text: '',
  highlighted: false,
};
```

To distinguish state definitions from states by names, a recommended practice is to prefix `$` to state definition names.

### Operating states

Operating states in Statofu means the same as changing states. Operating one state involves a reducer that accepts one old state and optional payloads to return one new state:

```ts
function check(state: CheckboxState): CheckboxState {
  return { ...state, checked: true };
}

function setText(state: TextareaState, text: string): TextareaState {
  return { ...state, text };
}

store.operate($checkboxState, check); // { checked: true, highlighted: false }
store.operate($textareaState, setText, 'Lorem ipsum'); // { text: 'Lorem ipsum', highlighted: false }
```

Operating multiple states involves a reducer that accepts a tuple of multiple old states and optional payloads to produce a tuple of multiple new states in the same order:

```ts
function uncheckWithTextCleaned([checkboxState, textareaState]: [CheckboxState, TextareaState]): [
  CheckboxState,
  TextareaState
] {
  return [
    { ...checkboxState, checked: false },
    { ...textareaState, text: '' },
  ];
}

store.operate([$checkboxState, $textareaState], uncheckWithTextCleaned); // [{ checked: false, highlighted: false }, { text: '', highlighted: false }]
```

By the way, there is no limitation to either the count or the types of payloads in a reducer:

```ts
function setTextVariously(
  state: TextareaState,
  s: string,
  n: number,
  b: boolean,
  f: () => string
): TextareaState {
  return { ...state, text: `${s} ${n} ${b} ${f()}` };
}

store.operate($textareaState, setTextVariously, 'Lorem ipsum', 0, false, () => 'dolor sit amet'); // { text: 'Lorem ipsum 0 false dolor sit amet', highlighted: false }
```

Another tip is, as reducers are just pure functions, a reducer can directly call another reducer without side effects as long as the final states make sense:

```ts
function checkWithHighlighted(state: CheckboxState): CheckboxState {
  return { ...check(state), highlighted: true };
}

function checkWithTextCleaned([checkboxState, textareaState]: [CheckboxState, TextareaState]): [
  CheckboxState,
  TextareaState
] {
  return [check(checkboxState), { ...textareaState, text: '' }];
}

store.operate($checkboxState, checkWithHighlighted); // { checked: true, highlighted: true }
store.operate([$checkboxState, $textareaState], checkWithTextCleaned); // [{ checked: true, highlighted: true }, { text: '', highlighted: false }]
```

### Snapshotting states

Snapshotting states in Statofu means the same as getting states. It's doable to snapshot either one or multiple states:

```ts
const checkboxState1 = store.snapshot($checkboxState);
const textareaState1 = store.snapshot($textareaState);
const [checkboxState2, textareaState2] = store.snapshot([$checkboxState, $textareaState]);
```

Selectors can be used to derive data in Statofu. A selector is a pure function that accepts either one or multiple states and optional payloads to produce a value as a derived datum:

```ts
function selectIsChecked(state: CheckboxState): boolean {
  return state.checked;
}

function selectDoesTextInclude(state: TextareaState, searchText: string): boolean {
  return state.text.includes(searchText);
}

function selectIsAnyHighlighted([checkboxState, textareaState]: [
  CheckboxState,
  TextareaState
]): boolean {
  return checkboxState.highlighted || textareaState.highlighted;
}

const isChecked = store.snapshot($checkboxState, selectIsChecked);
const doesTextIncludeLorem = store.snapshot($textareaState, selectDoesTextInclude, 'Lorem');
const isAnyHighlighted = store.snapshot([$checkboxState, $textareaState], selectIsAnyHighlighted);
```

### Subscribing states changes

Statofu supports subscribing to (1) one-state, (2) multiple-state, or (3) any-state changes. When one state gets operated and the new state goes referentially different(`!==`) from the old state, one-state change listeners on the one, multiple-state change listeners on some multiple states containing the one, and all any-state change listeners get called once:

```ts
// (1)
function onCheckboxStateChange(newState: CheckboxState, oldState: CheckboxState): void {}

// (2)
function onTextareaStateChange(newState: TextareaState, oldState: TextareaState): void {}

// (3)
function onCheckboxTextareaStatesChange(
  [newCheckboxState, newTextareaState]: [CheckboxState, TextareaState],
  [oldCheckboxState, oldTextareaState]: [CheckboxState, TextareaState]
): void {}

// (4)
function onAnyStateChange(
  newStates: OneOrMulti<StatofuState>,
  oldStates: OneOrMulti<StatofuState>
): void {}

const unsubscribeNo1 = store.subscribe($checkboxState, onCheckboxStateChange);
const unsubscribeNo2 = store.subscribe($textareaState, onTextareaStateChange);
const unsubscribeNo3 = store.subscribe(
  [$checkboxState, $textareaState],
  onCheckboxTextareaStatesChange
);
const unsubscribeNo4 = store.subscribe(onAnyStateChange);

store.operate($checkboxState, check); // Listeners #1, #3 and #4 get called once
store.operate($textareaState, setText, 'Lorem ipsum'); // Listeners #2, #3 and #4 get called once
```

When multiple states get operated and at least one of the new states goes referentially different(`!==`) from that of the old states, one-state change listeners on some one state contained by the changed parts, multiple-state change listeners on some multiple states intersecting with the changed parts, and all any-state change listeners get called once:

```ts
store.operate([$checkboxState, $textareaState], uncheckWithTextCleaned); // Listeners #1, #2, #3 and #4 get called once
```

To unsubscribe from state changes, it's doable by calling either `store.unsubscribe` or the callback returned by `store.subscribe`. If only states are specified on calling `store.unsubscribe`, all listeners on the specified states' changes go deactivated. But notice that, deactivating all listeners on one-state changes doesn't affect any listeners on multiple-state changes and vice versa.

## Recipes

### Recommended code structure

Usually, when a state management library is used, you are going to manage states across UI components. A set of UI components that share states constitute a UI module or a frontend app. Assuming there is a standalone directory hosting a module/app, a standalone file can be created per state in it for hosting (1) a state definition, (2) available reducers, and (3) available selectors. In case there are many state files, another directory can be created in the module/app directory for hosting them. This approach helps understand each state more easily:

```ts
// SomeModule/states/CheckboxState.ts
export interface CheckboxState {
  checked: boolean;
  highlighted: boolean;
}

export const $checkboxState = {
  checked: false,
  highlighted: false,
};

export function check(state: CheckboxState): CheckboxState {
  return { ...state, checked: true };
}

// More reducers ...

export function selectIsChecked(state: CheckboxState): boolean {
  return state.checked;
}

// More selectors ...
```

```ts
// SomeModule/states/TextareaState.ts
export interface TextareaState {
  text: string;
  highlighted: boolean;
}

export const $textareaState = {
  text: '',
  highlighted: false,
};

export function setText(state: TextareaState, text: string): TextareaState {
  return { ...state, text };
}

// More reducers ...

export function selectDoesTextInclude(state: TextareaState, searchText: string): boolean {
  return state.text.includes(searchText);
}

// More selectors ...
```

Afterward, a store needs to be created on the module/app initialized (and cleared on the module/app destroyed). Besides, the store needs to be made accessible to the components in the module/app, so that you can use the store in any component with exports from the state files for state management:

```ts
// SomeModule/SomePseudoComponent.ts
import {
  $checkboxState,
  check,
  selectIsChecked,
  uncheckWithTextCleaned,
} from './states/CheckboxState';
import { $textareaState, selectDoesTextInclude, setText } from './states/TextareaState';

// Events handlers

function onCheckboxToggle(checked: boolean): void {
  if (checked) {
    store.operate($checkboxState, check);
  } else {
    store.operate([$checkboxState, $textareaState], uncheckWithTextCleaned);
  }
}

function onTextareaChange(text: string): void {
  store.operate($textareaState, setText, text);
}

// Rendering

function renderCheckbox(/* ... */): Element {
  const { checked, highlighted } = store.snapshot($checkboxState);

  // ...
}

function renderTextarea(/* ... */): Element {
  const { text, highlighted } = store.snapshot($textareaState);
  const isChecked = store.snapshot($checkboxState, selectIsChecked);

  // ...
}

function renderTodoHint(/* ... */): Element {
  const doesTextIncludeTODO = store.snapshot($textareaState, selectDoesTextInclude, 'TODO');

  // ...
}

function onComponentInitialized(): void {
  store.subscribe([$checkboxState, $textareaState], (/* ... */) => {
    rerender(/* ... */);
  });
}

// More UI logics ...
```

### Integration with React

Statofu is designed as framework-agnostic and works with any framework. To integrate Statofu with a framework, there are only 3 points to be handled, (1) binding a store's lifecycle with a module/app's, (2) making the store accessible to the components in the module/app and (3) having latest states observed promptly for rendering. A preliminary demo of integrating Statofu with React looks as below:

```tsx
// StatofuReact.tsx
import { createStatofuStore, OneOrMulti, StatofuState, StatofuStore } from 'statofu';

// For point #1
export function useBindStore(): StatofuStore {
  const refStore = useRef<StatofuStore | null>(null);

  if (!refStore.current) {
    refStore.current = createStatofuStore();
  }

  useEffect(() => {
    const store = refStore.current;
    return () => {
      if (store) {
        store.clear();
      }
    };
  }, []);

  return refStore.current;
}

// For point #2
const StoreContext = createContext<StatofuStore | null>(null);

export function StoreProvider({ children }: PropsWithChildren): ReactElement {
  const store = useBindStore();
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): StatofuStore {
  const store = useContext(StoreContext);

  if (!store) {
    throw new Error('Store not found');
  }

  return store;
}

// For point #3
export function useSnapshot<TStates extends OneOrMulti<StatofuState>>($states: TStates): TStates {
  const store = useStore();

  const subscribeStates = useCallback(
    (listener: () => void) => store.subscribe($states, listener),
    [$states, store]
  );

  return useSyncExternalStore(subscribeStates, () => store.snapshot($states));
}
```

Then, the use of this demo integration feels as below:

```tsx
// SomeModule/TheRootComponent.tsx
import { StoreProvider } from '../StatofuReact';
import { SomeOtherComponent } from './SomeOtherComponent';

export function TheRootComponent(): ReactElement {
  return (
    <StoreProvider>
      {/* ... */}
      <SomeOtherComponent />
      {/* ... */}
    </StoreProvider>
  );
}
```

```tsx
// SomeModule/SomeOtherComponent.tsx
import { useSnapshot, useStore } from '../StatofuReact';

export function SomeOtherComponent(): ReactElement {
  const store = useStore();
  const [checkboxState, textareaState] = useSnapshot([$checkboxState, $textareaState]);

  const onCheckboxToggle = useCallback(
    (checked: boolean): void => {
      if (checked) {
        store.operate($checkboxState, check);
      } else {
        store.operate([$checkboxState, $textareaState], uncheckWithTextCleaned);
      }
    },
    [store]
  );

  const onTextareaChange = useCallback(
    (text: string): void => {
      store.operate($textareaState, setText, text);
    },
    [store]
  );

  return (
    <div>
      {/* ... */}
      <Checkbox {...checkboxState} onToggle={onCheckboxToggle} />
      {/* ... */}
      <Textarea {...textareaState} onChange={onTextareaChange} />
      {/* ... */}
    </div>
  );
}
```

Currently, Statofu's official support for integrations with different frameworks is still in progress. For React, it's [statofu-react](https://github.com/statofu/statofu-react). For Vue, it's [statofu-vue](https://github.com/statofu/statofu-vue). The naming convention is `statofu-{{framework}}`. If you find yourself interested in the integrations, we may do it together.

## APIs

### `createStatofuStore`

Creates a Statofu store.

```ts
const store = createStatofuStore();
```

### `store.operate`

Operates either one or multiple states with a reducer and the required payloads of the reducer. The latest states are returned.

```ts
const checkboxState1 = store.operate($checkboxState, check);
const textareaState1 = store.operate($textareaState, setText, 'Lorem ipsum');
const [checkboxState2, textareaState2] = store.operate(
  [$checkboxState, $textareaState],
  uncheckWithTextCleaned
);
```

### `store.snapshot`

Snapshots either one or multiple states optionally with a selector and the required payloads of the selector.

```ts
const checkboxState1 = store.snapshot($checkboxState);
const textareaState1 = store.snapshot($textareaState);
const [checkboxState2, textareaState2] = store.snapshot([$checkboxState, $textareaState]);

const isChecked = store.snapshot($checkboxState, selectIsChecked);
const doesTextIncludeLorem = store.snapshot($textareaState, selectDoesTextInclude, 'Lorem');
const isAnyHighlighted = store.snapshot([$checkboxState, $textareaState], selectIsAnyHighlighted);
```

### `store.subscribe`

Subscribes to one-state, multiple-state or any-state changes with a listener, then returns the callback for deactivating the listener. The listener gets called once with the new states and the old states when at least one of the states in the subscription goes referentially different(`!==`) by a call of `store.operate`. For the unchanged parts of the states in the subscription, their new states stay referentially identical(`===`) to their old states on the listener called. Notice that, when a listener on any-state changes gets called, the new states and the old states passed into it vary in terms of what states are operated by a call of `store.operate`.

```ts
const unsubscribeCheckboxStateChanges = store.subscribe(
  $checkboxState,
  (newState: CheckboxState, oldState: CheckboxState): void => {
    // ...
  }
);
const unsubscribeCheckboxTextareaStatesChanges = store.subscribe(
  [$checkboxState, $textareaState],
  (
    [newCheckboxState, newTextareaState]: [CheckboxState, TextareaState],
    [oldCheckboxState, oldTextareaState]: [CheckboxState, TextareaState]
  ): void => {
    // ...
  }
);
const subscribeAnyStateChanges = store.subscribe(
  (newStates: OneOrMulti<StatofuState>, oldStates: OneOrMulti<StatofuState>): void => {
    // ...
  }
);
```

### `store.unsubscribe`

Unsubscribes from states changes. If both states and a listener are specified, only the specified listener goes deactivated on the states changes. If only states are specified, all listeners on the specified states' changes go deactivated. If nothing is specified, all listeners on all kinds of states' changes go deactivated.

```ts
store.unsubscribe($checkboxState, onCheckboxStateChange);
store.unsubscribe([$checkboxState, $textareaState], onCheckboxTextareaStatesChange);
store.unsubscribe(onAnyStateChange);

store.unsubscribe($checkboxState);
store.unsubscribe([$checkboxState, $textareaState]);
store.unsubscribe();
```

### `store.clear`

Clears everything in a store, including states and listeners, as if the store is newly created.

```ts
store.clear();
```

## About the name

Since the modernization in frontend development started, state management has been a pain to do.
It is, in nature, just reading and writing some data for certain use in a frontend app. It is supposed to be fun but not frustrated.

The name "Statofu" means bringing **state** management back **to** **fu**n, which is also the goal of Statofu. Having fun in state management helps us do it better. In return, better-done state management leads to a better frontend app.

The name "Statofu" is pronounced as a concatenation of the words state and tofu, which is [ˈsteitəʊfu]. By the way, tofu, as food with a history of over 2000 years, tastes smooth and benefits health, which accords with Statofu, too.

## Contributing

If you find any bugs or have any thoughts, you're always welcome to [open an issue](https://github.com/statofu/statofu/issues) or DM me on [Twitter](https://twitter.com/licg9999) or [Wechat](./assets/ed0458952a4930f1aeebd01da0127de240c85bbf.jpg). Looking forward to hearing from you 🔥.

## License

MIT, details in the [LICENSE](./LICENSE) file.
