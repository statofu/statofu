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

One big problem with today's widely accepted state management libraries is that predictable state changes have to come at a high cost. [A detailed article](https://github.com/statofu/statofu-blog/blob/main/20230525/README.en.md) was written for the explanation:

> ...
>
> Though, Redux is not perfect and has a drawback. If we take a closer look at its unidirectional data flow, `event -> action -> reducer -> state`, it's lengthy. No matter how simple a state change is, always at least one action and at least one reducer are involved. In comparison, a state change in either Recoil or MobX goes much easier. The lengthiness dramatically increases the cost of use in Redux.
>
> ...

Statofu is a state management library built to achieve **predictable state changes at a low cost** 🌈. It's framework-agnostic, small and fast.

## Framework Integrations

Statofu provides integrations with mainstream frameworks, including React, Vue, and more. The naming convention of the integration libraries is `statofu-{{framework}}`. Currently, [the React integration, `statofu-react`](https://github.com/statofu/statofu-react), has become available, and please check it out if React is in use. Below is a framework-agnostic guide.

## Installation

Statofu can be installed by `npm` or any preferred package manager:

```sh
npm i -S statofu # yarn or pnpm also works
```

Or, the UMD format can be loaded from an npm CDN instead:

```html
<script src="https://unpkg.com/statofu/dist/statofu.umd.min.js"></script>
```

The UMD name is `statofu`.

## Essentials

In Statofu, each kind of state change directly involves a different reducer that accepts one or multiple old states along with zero or more payloads and produces one or multiple new corresponding states. As reducers are pure functions, state changes are predictable. As reducers are directly involved, state changes come at a low cost. The usage is described as follows.

### Creating the store

First of all, a Statofu store needs to be created, for which `createStatofuStore` is used:

```ts
import { createStatofuStore } from 'statofu';

const store = createStatofuStore();
```

### Defining states

Next, states need to be defined, which is simply done by Plain Old JavaScript Object(POJO)s. A POJO, as a state definition, simultaneously, for a state, (1) holds the default state value, (2) declares the state type, and (3) indexes the current state value in a store. Here are two example state definitions, one for a selectable item panel, and the other for a hideable text editor:

```tsx
interface ItemPanelState {
  itemList: { id: string; text: string }[];
  selectedItemId: string | undefined;
}

const $itemPanelState: ItemPanelState = {
  itemList: [],
  selectedItemId: undefined,
};

interface TextEditorState {
  text: string;
  visible: boolean;
}

const $textEditorState: TextEditorState = {
  text: '',
  visible: false,
};
```

Usually, to distinguish state definitions from state values by names, `$` is prefixed to state definition names.

### Getting states

Then, to get state values, `store.snapshot` is used. It accepts one or multiple state definitions and returns the current one or multiple corresponding state values indexed by the state definitions:

```ts
const { itemList, selectedItemId } = store.snapshot($itemPanelState);
const { text, visible } = store.snapshot($textEditorState);
const [itemPanelState, textEditorState] = store.snapshot([$itemPanelState, $textEditorState]);
```

By the way, before a state is changed, its state value is the shallow copy of the default state value held by its state definition.

### Changing states

Now, let's dive into state changes. In Statofu, each kind of state change directly involves a different reducer. For changing one state, a reducer that accepts one old state along with zero or more payloads and produces one new corresponding state is involved. Here are three example reducers, two for changing `$itemPanelState`, and one for changing `$textEditorState`:

```tsx
function selectItem(state: ItemPanelState, itemIdToSelect: string): ItemPanelState {
  return { ...state, selectedItemId: itemIdToSelect };
}

function unselectItem(state: ItemPanelState): ItemPanelState {
  return { ...state, selectedItemId: undefined };
}

function setText(state: TextEditorState, text: string): TextEditorState {
  return { ...state, text };
}
```

For changing multiple states, a reducer that accepts multiple old states along with zero or more payloads and produces multiple new corresponding states is involved. Here is an example reducer for changing `$itemPanelState` and `$textEditorState`:

```tsx
function submitTextForSelectedItem([textEditor, itemPanel]: [TextEditorState, ItemPanelState]): [
  TextEditorState,
  ItemPanelState
] {
  return [
    { ...textEditor, visible: false },
    {
      ...itemPanel,
      itemList: itemPanel.itemList.map((item) => {
        if (item.id === itemPanel.selectedItemId) {
          return { ...item, text: textEditor.text };
        } else {
          return item;
        }
      }),
      selectedItemId: undefined,
    },
  ];
}
```

With reducers ready, to involve them to change states, `store.operate` is used:

```ts
store.operate($itemPanelState, selectItem, 'ed3a06a1');

store.operate($itemPanelState, unselectItem);

store.operate($textEditorState, setText, 'Nulla fermentum aliquet ornare.');

store.operate([$textEditorState, $itemPanelState], submitTextForSelectedItem);
```

Inside a call of an operating function, the current state values indexed by the state definitions are passed into the reducer to produce the next state values which are, in turn, saved to the store.

### Subscribing

Thereafter, to respond when states change, `store.subscribe` is used. It accepts one state definition along with a one-state change listener, multiple state definitions along with a multiple-state change listener, or no state definition but an any-state change listener and returns the corresponding unsubscribing function:

```ts
// #1, subscribing to the changes of `$itemPanelState`.
const unsubscribeNo1 = store.subscribe($itemPanelState, (newState, oldState) => {});

// #2, subscribing to the changes of `$textEditorState`.
const unsubscribeNo2 = store.subscribe($textEditorState, (newState, oldState) => {});

// #3, subscribing to the changes of `$itemPanelState` and `$textEditorState`.
const unsubscribeNo3 = store.subscribe(
  [$itemPanelState, $textEditorState],
  ([newItemPanel, newTextEditor], [oldItemPanel, oldTextEditor]) => {}
);

// #4, subscribing to the changes of any states.
const unsubscribeNo4 = store.subscribe((newStates, oldStates) => {});
```

When certain states go referentially different by a call of `store.operate`, one-state change listeners on one of them, multi-state change listeners on the states intersecting with them, and all any-state change listeners get called:

```ts
// As $itemPanelState changes, listeners of #1, #3, #4 get called.
store.operate($itemPanelState, selectItem, itemId);

// As $textEditorState and $itemPanelState change, listeners of #1, #2 #3, #4 get called.
store.operate([$textEditorState, $itemPanelState], submitTextForSelectedItem);
```

### Deriving data

Furthermore, to derive data from states, a selector that accepts one or multiple states along with zero or more payloads and calculates a value can be used in combination with `store.snapshot` or `store.subscribe`. Selectors can be named functions:

```ts
function getSelectedItem(state: ItemPanelState): ItemPanelState['itemList'][number] | undefined {
  return state.itemList.find(({ id }) => id === state.selectedItemId);
}

function getRelatedItems([itemPanel, textEditor]: [
  ItemPanelState,
  TextEditorState
]): ItemPanelState['itemList'] {
  return itemPanel.itemList.filter(({ text }) => text.includes(textEditor.text));
}

function getTextWithFallback(state: TextEditorState, fallback: string): string {
  return state.text || fallback;
}

function isVisible(state: TextEditorState): boolean {
  return state.visible;
}

const selectedItem = store.snapshot($itemPanelState, getSelectedItem);
const relatedItems = store.snapshot([$itemPanelState, $textEditorState], getRelatedItems);
const textWithFallback = store.snapshot($textEditorState, getTextWithFallback, 'Not Available');
const visible = store.snapshot($textEditorState, isVisible);

store.subscribe([$itemPanelState, $textEditorState], ([itemPanel, textEditor]) => {
  const selectedItem = getSelectedItem(itemPanel);
  const relatedItems = getRelatedItems([itemPanel, textEditor]);
  const textWithFallback = getTextWithFallback(textEditor, 'Not Available');
  const visible = isVisible(textEditor);
});
```

Also, selectors can be anonymous functions:

```ts
const selectedItemId = store.snapshot($itemPanelState, (state) => state.selectedItemId);
```

## Recipes

### Code Structure

In Statofu, the management of a state consists of (1) a state definition, (2) zero or more reducers, and (3) zero or more selectors. So, a recommended practice is to place the three parts of a state sequentially into one file, which leads to good maintainability. (In addition, as there are only POJOs and pure functions in each file, this code structure also leads to good portability.) Let's reorganize the states in Essentials for an example:

```tsx
// states/ItemPanelState.ts
import type { TextEditorState } from './TextEditorState';

export interface ItemPanelState {
  itemList: { id: string; text: string }[];
  selectedItemId: string | undefined;
}

export const $itemPanelState: ItemPanelState = {
  itemList: [],
  selectedItemId: undefined,
};

export function selectItem(state: ItemPanelState, itemIdToSelect: string): ItemPanelState {
  // ...
}

export function unselectItem(state: ItemPanelState): ItemPanelState {
  // ...
}

export function getSelectedItem(
  state: ItemPanelState
): ItemPanelState['itemList'][number] | undefined {
  // ...
}

export function getRelatedItems([itemPanel, textEditor]: [
  ItemPanelState,
  TextEditorState
]): ItemPanelState['itemList'] {
  // ...
}
```

```tsx
// states/TextEditorState.ts
import type { ItemPanelState } from './ItemPanelState';

export interface TextEditorState {
  text: string;
  visible: boolean;
}

export const $textEditorState: TextEditorState = {
  text: '',
  visible: false,
};

export function setText(state: TextEditorState, text: string): TextEditorState {
  // ...
}

export function submitTextForSelectedItem([textEditor, itemPanel]: [
  TextEditorState,
  ItemPanelState
]): [TextEditorState, ItemPanelState] {
  // ...
}

export function getTextWithFallback(state: TextEditorState, fallback: string): string {
  // ...
}

export function isVisible(state: TextEditorState): boolean {
  // ...
}
```

### Server-side rendering(SSR)

In general, SSR needs 2 steps. (1) On the server side, states are prepared as per a page request, an HTML body is rendered with the states, and the states are serialized afterward. Then, the two are piped into the response. (2) On the client side, the server-serialized states are deserialized, then components are rendered with the states to properly hydrate the server-rendered HTML body.

To help with SSR, Statofu provides helpers of bulk reading to-serialize states from a store and bulk writing deserialized states to a store. But, serialization/deserialization is beyond the scope because it's easily doable via a more specialized library such as `serialize-javascript` or some built-in features of a full-stack framework such as data fetching of `next`.

Here is a semi-pseudocode example for SSR with Statofu. Firstly, `serialize-javascript` is installed for serialization/deserialization:

```sh
npm i -S serialize-javascript
```

Next, on the server side:

```tsx
import { renderToString } from 'react-dom/server';
import serialize from 'serialize-javascript';
import { createStatofuState } from 'statofu';
import { StoreProvider } from 'statofu-react';
import { foldStates } from 'statofu/ssr';

app.get('/some-page', (req, res) => {
  const store = createStatofuState();

  const itemPanelState = prepareItemPanelState(req);
  store.operate($itemPanelState, itemPanelState);

  const textEditorState = prepareItemPanelState(req);
  store.operate($textEditorState, textEditorState);

  const htmlBody = renderHtmlBodyAsString(store);

  const stateFolder = foldStates(store, { $itemPanelState, $textEditorState });

  res.send(`
...
<script>window.SERIALIZED_STATE_FOLDER='${serialize(stateFolder)}'</script>
...
<div id="root">${htmlBody}</div>
...`);
});
```

Afterward, on the client side:

```tsx
import { createStatofuState } from 'statofu';
import { unfoldStates } from 'statofu/ssr';

// ...

const stateFolder = eval(`(${window.SERIALIZED_STATE_FOLDER})`);

delete window.SERIALIZED_STATE_FOLDER;

const store = createStatofuState();

unfoldStates(store, { $itemPanelState, $textEditorState }, stateFolder);

hydrateServerRenderedHtmlBody(store);
```

Note that, this example can be optimized in different ways like rendering the HTML body as a stream. When using it in the real world, we should tailor it to real-world needs.

## APIs

### `createStatofuStore`

The function to create a store:

```ts
const store = createStatofuStore();
```

#### `store.snapshot`

The method to get state values:

```ts
const { itemList, selectedItemId } = store.snapshot($itemPanelState);
const { text, visible } = store.snapshot($textEditorState);
const [itemPanelState, textEditorState] = store.snapshot([$itemPanelState, $textEditorState]);
```

It can accept selectors:

```ts
const selectedItem = store.snapshot($itemPanelState, getSelectedItem);
const relatedItems = store.snapshot([$itemPanelState, $textEditorState], getRelatedItems);
const textWithFallback = store.snapshot($textEditorState, getTextWithFallback, 'Not Available');
const visible = store.snapshot($textEditorState, isVisible);
const selectedItemId = store.snapshot($itemPanelState, (state) => state.selectedItemId);
```

### `store.operate`

The method to change states by involving reducers:

```ts
store.operate($itemPanelState, selectItem, 'ed3a06a1');

store.operate($itemPanelState, unselectItem);

store.operate($textEditorState, setText, 'Nulla fermentum aliquet ornare.');

store.operate([$textEditorState, $itemPanelState], submitTextForSelectedItem);
```

### `store.subscribe`

The method to subscribe to state changes. It returns the corresponding unsubscribing function:

```ts
// #1, subscribing to the changes of `$itemPanelState`.
const unsubscribeNo1 = store.subscribe($itemPanelState, (newState, oldState) => {});

// #2, subscribing to the changes of `$textEditorState`.
const unsubscribeNo2 = store.subscribe($textEditorState, (newState, oldState) => {});

// #3, subscribing to the changes of `$itemPanelState` and `$textEditorState`.
const unsubscribeNo3 = store.subscribe(
  [$itemPanelState, $textEditorState],
  ([newItemPanel, newTextEditor], [oldItemPanel, oldTextEditor]) => {}
);

// #4, subscribing to the changes of any states.
const unsubscribeNo4 = store.subscribe((newStates, oldStates) => {});
```

### `store.unsubscribe`

The method to unsubscribe from state changes. The more params are specified, the more limited the effect is:

```ts
// All listeners on the changes of `$itemPanelState` go detached.
store.unsubscribe($itemPanelState);

// All listeners on the changes of `$itemPanelState` and `$textEditorState` go detached.
store.unsubscribe([$itemPanelState, $textEditorState]);

// Only the specified listener on the changes of `$itemPanelState` goes detached.
store.unsubscribe($itemPanelState, handleItemPanelStateChange);

// Only the specified listener on the changes of any states goes detached.
store.unsubscribe(handleAnyStateChange);

// All listeners on one, multiple, or any states go detached.
store.unsubscribe();
```

### `store.clear`

The function to clear everything in the store:

```ts
store.clear();
```

## About the name

Since the early days of modern frontend development, state management has been a pain. But in nature, it is just reading and writing data for some specific needs in a frontend app. It shouldn't be so frustrating but should be fun.

The name "Statofu" means bringing **state** management back **to** **fu**n, which is also the ultra goal of Statofu. Having fun in state management helps us do it better. In return, better-done state management leads to a better frontend app.

The name "Statofu" is pronounced as a concatenation of the words state and tofu, which is [ˈsteitəʊfu]. By the way, tofu, a food with a history of over 2000 years, tastes smooth and benefits health, which accords with Statofu, too.

## Contributing

For any bugs or any thoughts, welcome to [open an issue](https://github.com/statofu/statofu-react/issues), or just DM me on [Twitter](https://twitter.com/licg9999) / [Wechat](./assets/ed0458952a4930f1aeebd01da0127de240c85bbf.jpg).

## License

MIT, details in the [LICENSE](./LICENSE) file.
