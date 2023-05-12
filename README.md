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

Two problems that today's widely-accepted libraries of state management don't actually handle well are (1) predictability of states changing and (2) overall cost of development on use.

Taking an example in React, Redux uses reducers/slices to make one-state changing predictable without tracking function bodies but multi-state changing is not the case. When a simple action changes one state, what one state it changes can be understood clearly by checking what reducer/slice responds to it, which often involves checking delcarative information only:

```ts
const checkboxSlice = createSlice({
  name: 'checkbox',
  initialState: {
    checked: false,
  },
  reducers: {
    check(state) {
      state.checked = true;
    },
  },
});

const { check } = checkboxSlice.actions;

// By checking `check` is declared in `checkboxSlice`, we know `checkboxSlice` responds to `check` so `check` changes the one state represented by `checkboxSlice`.
```

But, when a complicated action changes multi states, what multi states it changes needs to be figured out by tracking what simple actions it invokes and what redcuers/slices respond to the invoked simple actions, which always involves trakcing function bodies:

```diff
const checkboxSlice = createSlice({
  name: 'checkbox',
  initialState: {
    checked: false,
  },
  reducers: {
    check(state) {
      state.checked = true;
    },
+
+    uncheck(state) {
+      state.checked = false;
+    },
  },
});

-const { check } = checkboxSlice.actions;
+const { check, uncheck } = checkboxSlice.actions;

// The underlying simple action `uncheck` needs to be built in advance for the complicated action `uncheckWithTextCleaned` but may never get invoked anywhere else.
```

```ts
const textareaSlice = createSlice({
  name: 'textarea',
  initialState: {
    text: '',
  },
  reducers: {
    setText(state, action: PayloadAction<string>) {
      state.text = action.payload;
    },
  },
});

const { setText } = textareaSlice.actions;

function uncheckWithTextCleaned(): AppThunk {
  return (dispatch) => {
    dispatch(uncheck());
    dispatch(setText(''));
  };
}

// By tracking `uncheckWithTextCleaned` invokes `uncheck` declared in `checkboxSlice` and `setText` declared in `textareaSlice`, we know `uncheckWithTextCleaned` changes the multi states represented by `checkboxSlice` and `textareaSlice`.
```

Without tracking function bodies, the multi states to be changed remain unknown so multi-state changing goes unpredictable. With tracking function bodies, the multi states to be changed get known but overall cost of development on use increases. In addition, when underlying simple actions to be invoked in a complicated action to be built are not yet ready, they need to be built in advance only for it but may never get invoked anywhere else. Then, complicated actions become high-coupling with their underlying reducers/slices, which brings difficulties in development, thus the cost increases further.

The problems exist not only in Redux but also in many widely-accepted libraries of state management in React. [A series of articles](https://github.com/licg9999/review-of-state-management-in-react) was written for the clarification. Further more, with a glimpse of the most widely-accepted library of state management in each of different frameworks, the problems are considered to exist universally.

Therefore, Statofu, another framework-agnostic, fast and small library of state management, is built. It's able to make both one-state and multi-state changing predictable without tracking any function bodies. Besides, necessities but only necessities of state management are included so overall cost of development on use decreases in primary aspects. Let's check it out 🌈.

## Installation

Statofu can be installed by `npm` or any package manager you prefer:

```sh
npm i -S statofu
```

Or, its UMD format can be loaded from a npm CDN:

```html
<script src="https://unpkg.com/statofu/dist/statofu.umd.min.js"></script>
```

The UMD name is `statofu`.

## Essentials

### Creating a store

In Statofu, states are managed by a store. The API `createStatofuStore` returns a store:

```ts
import { createStatofuStore } from 'statofu';

const store = createStatofuStore();
```

### Defining states

A state in Statofu is defined by a Plain Old JavaScript Object(POJO). A POJO itself is not a state but a state definition, (1) identifying a state in a store, (2) hosting the default state and (3) declaring the state type:

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

To tell state definitions from states by names, it's recommended to prefix `$` to names of state definitions.

### Operating states

Operating states in Statofu means changing states. Operating one state involves a pure function that processes old one state and optional payloads to return new one state:

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

Operating multi states involves a pure function that processes a old multi states tuple and optional payloads to return a new multi states tuple:

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

A pure function in Statofu behaves as above is a reducer. This reducer is the same concept as in Redux. The difference is, a reducer in Redux handles all kinds of state-changing logics on one state in terms of all kinds of actions, but a reducer in Statofu handles only one kind of state-changing logics on either one or multi states in terms of only one kind of payloads.

As each reducer in Statofu is designed to handle either one-state or multi-state changing as a pure function without any side effects, what states it changes can be understood clearly by checking its function declaration only, which makes both one-state and multi-state changing predictable without tracking any function bodies. As each reducer in Statofu is designed to handle only one kind of state-changing logics in terms of only one kind of payloads, different kinds of state-changing logics can be placed in different reducers separately, which makes state-changing logics well structured easily.

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

Another tip is, as reducers are pure functions in nature, a reducer can directly invoke another reducer as a pure function as long as the finally returned states make sense:

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

Snapshotting states in Statofu means getting states. Snapshotting can be done to either one or multi states:

```ts
const checkboxState1 = store.snapshot($checkboxState);
const textareaState1 = store.snapshot($textareaState);
const [checkboxState2, textareaState2] = store.snapshot([$checkboxState, $textareaState]);
```

Data deriving in Statofu is achieved by selectors. A selector is a pure function that processes either one or multi states and optional payloads to return a value as a derived datum:

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

In Statofu, a listener can be taken to subscribe to (1) one-state, (2) multi-state, or (3) any-state changes. When one state gets operated and the new state goes referentially different(`!==`) from the old state, one-state change listeners on the one, multi-state change listeners on some multi containing the one and all any-state change listeners get called once:

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

When multi states get operated and at least one of the new states goes referentially different(`!==`) from that in the old states, one-state change listeners on some one contained by the changed parts, multi-state change listeners on some multi intersecting with the changed parts and all any-state change listeners get called once:

```ts
store.operate([$checkboxState, $textareaState], uncheckWithTextCleaned); // Listeners #1, #2, #3 and #4 get called once
```

To unsubscribe from states changes, it's doable by calling either `store.unsubscribe` or the callback returned by `store.subscribe`. If only states are specified on calling `store.unsubscribe`, all listeners on the states changes go deactivated. Though, deactivating all listeners on one-state changes doesn't affect any listeners on multi-state changes and vice versa.

## Recipes

### Recommended code structure

Usually, when you start using a library of state management, you mean to manage states across UI components. UI components sharing a set of states constitue a UI module. (A UI module is just the client app if it has no other UI module as its parent.) Assuming the whole module resides in a standalone module directory, you may place logics on a state into a standalone state file in the module directory.

With each of the state files, you can easily understand (1) a state definition, (2) available states changing on the state and (3) available data deriving on the state. Also, they are very indepdent from the rest of the module or even from Statofu, which benefits maintainability:

```ts
// SomeModule/CheckboxState.ts
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
// SomeModule/TextareaState.ts
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

After that, you can get a store created on the module initialized and cleared on the module destroyed. Meanwhile, you can make the store accessible to components in the module. Then, in the components, you can call the store APIs along with exports from the state files to develop UI logics as you wish:

```ts
// SomeModule/SomePseudoComponent.ts
import { $checkboxState, check, selectIsChecked, uncheckWithTextCleaned } from './CheckboxState';
import { $textareaState, selectDoesTextInclude, setText } from './TextareaState';

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

Statofu is designed as framework-agnostic and is supposed to work with any framework. To integrate Statofu with a framework, you may simply deal with 3 points, (1) binding a store's lifecyle with a module's, (2) making the store accessible to components in the module and (3) having latest states observed in a timely manner for rendering. A simple demo of integrating Statofu with React looks as below:

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

Then, use of the demo integration feels as below:

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

Currently, Statofu's official integrations with different frameworks are still being actively developed. For React, it's [statofu-react](https://github.com/statofu/statofu-react). For Vue, it's [statofu-vue](https://github.com/statofu/statofu-vue). The naming convention is `statofu-{{framework}}`. If you find yourself interested in the integrations development, we may do it together.

## APIs

### `createStatofuStore`

Creates a Statofu store.

```ts
const store = createStatofuStore();
```

### `store.operate`

Operates either one or multi states with a reducer and required payloads of the reducer. The latest states are returned.

```ts
const checkboxState1 = store.operate($checkboxState, check);
const textareaState1 = store.operate($textareaState, setText, 'Lorem ipsum');
const [checkboxState2, textareaState2] = store.operate(
  [$checkboxState, $textareaState],
  uncheckWithTextCleaned
);
```

### `store.snapshot`

Snapshots either one or multi states optionally with a selector and required payloads of the selector.

```ts
const checkboxState1 = store.snapshot($checkboxState);
const textareaState1 = store.snapshot($textareaState);
const [checkboxState2, textareaState2] = store.snapshot([$checkboxState, $textareaState]);

const isChecked = store.snapshot($checkboxState, selectIsChecked);
const doesTextIncludeLorem = store.snapshot($textareaState, selectDoesTextInclude, 'Lorem');
const isAnyHighlighted = store.snapshot([$checkboxState, $textareaState], selectIsAnyHighlighted);
```

### `store.subscribe`

Subscribes to one-state, multi-state or any-state changes with a listener, then returns the callback for unsubscribing the listener from the states changes. The listener gets called once with the new states and the old states when at least one of the states in the subscription goes referentially different(`!==`) by a call of `store.operate`. For the unchanged parts of the states in the subscription, their new states stay referentially identical(`===`) to their old states on the listener called. Notice that, when a listener on any-state changes gets called, the new states and the old states passed into it vary in terms of what states are operated by a call of `store.operate`.

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

Unsubscribes from states changes. If both states and a listener are specified, only the listener goes deactivated on the states changes. If only states are specified, all listeners on the states changes go deactivated. If nothing is specified, all listeners on all kinds of states changes go deactivated.

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

Since the modernization in frontend development starts, doing state management has been a pain. How can just reading and writing some data for some use on the client be so difficult? There is no fun at all.

The name Statofu means bringing **state** management back **to** **fu**n, which is just the core idea of Statofu. Only when we as devs have fun in doing state management, we can do it well. Also, good state management constitues a necessity for a good client app. As a forseeable result, having fun in doing state management leads to developing a good client app.

The name Statofu can be pronounced like a concatenation of the words state and tofu, which is [ˈsteitəʊfu]. By the way, tofu, as food with a history of over 2000 years, tastes smooth and benefits health, which accords with the core idea of Statofu more or less.

## Contributing

If you meet any bugs or have any thoughts, it's always welcomed to [open an issue](https://github.com/statofu/statofu/issues). Or, if that's not your case, it's very OK to DM me on [Twitter](https://twitter.com/licg9999) or [Wechat](./assets/ed0458952a4930f1aeebd01da0127de240c85bbf.jpg). Looking forward to hearing from you for any topics on Statofu 🔥.

## License

MIT, details are listed in the [LICENSE](./LICENSE) file.
