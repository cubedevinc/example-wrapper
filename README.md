# Cube examples wrapper

This package contains common layout and features like user tracking, feedback, and errors logging for Cube's [example applications](https://github.com/cube-js/cube.js/tree/master/examples).

## Installation

Install package via `yarn`:

```bash
yarn add @cube-dev/example-wrapper
```

## Usage

At the entry point of your app, import `createExampleWrapper` helper:

```js
import createExampleWrapper from "@cube-dev/example-wrapper";
```

Define an example description object and fill it with your values:

```js
const exampleDescription = {
  title: "demo title",
  text: `demo description text`,
};
```

*Note: you can use HTML tags inside the `text` template string.*

Call and pass `exampleDescription` into helper:

```js
createExampleWrapper(exampleDescription);
```
