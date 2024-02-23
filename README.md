# check-compiler-js

[![tests](https://github.com/akornatskyy/check-compiler-js/actions/workflows/tests.yml/badge.svg)](https://github.com/akornatskyy/check-compiler-js/actions/workflows/tests.yml) [![npm version](https://badge.fury.io/js/check-compiler.svg)](https://www.npmjs.com/package/check-compiler)

A typescript-first schema rule compiler and validation library.

- no dependencies
- reusable schema definitions
- node.js and browsers
- tiny [minified+gzipped](https://bundlephobia.com/package/check-compiler)

## Install

Enable [strict](https://www.typescriptlang.org/tsconfig#strict) mode in
`tsconfig.json`.

```sh
npm i check-compiler
```

## Usage

Creating a simple string schema:

```ts
import {compile, Rule, Violation} from 'check-compiler';

// define
const id: Rule<string> = {
  type: 'string',
  min: 8,
  max: 8,
  pattern: /^[a-z]+$/,
  messages: {
    'string pattern': 'Required to be lowercase alpha only.',
  },
};

// compile
const checkId = compile(id);

// check
const input = 'abcdefgh';
const violations: Violation[] = [];
checkId(input, violations);
```

Creating an object schema:

```ts
import {compile, Rule, Violation} from 'check-compiler';

// type
type ResourceMap = {
  cpu?: number | null;
  memory?: number | null;
};

// define
const cpu: Rule<number | null> = {
  type: 'number',
  nullable: true,
  min: 0,
  max: 8000,
};
const memory: Rule<number | null> = {
  type: 'number',
  nullable: true,
  min: 0,
  max: 32768,
};
const resourceMap: Rule<ResourceMap | null> = {
  type: 'object',
  nullable: true,
  properties: {
    cpu,
    memory,
  },
};

// compile
const checkResourceMap = compile(resourceMap);

// check
const input: ResourceMap = {cpu: 1000, memory: 512};
const violations: Violation[] = [];
checkResourceMap(input, violations);
```

Defining validation by raising `ValidationError`:

```ts
import {compile, Check, Violation} from 'check-compiler';

export class ValidationError extends Error {
  constructor(readonly details: Violation[]) {
    super('There is one or more validation violations.');
  }
}

export function makeAssetValid<T>(check: Check<T>): (input: T) => void {
  return (input: T) => {
    const violations: Violation[] = [];
    check(input, violations);
    if (violations.length > 0) {
      throw new ValidationError(violations);
    }
  };
}

// compile
export const assertResourceMap = makeAssetValid(
  compile<ResourceMap>({
    type: 'object',
    nullable: true,
    properties: {
      cpu: {type: 'number', nullable: true, min: 0, max: 8000},
      memory: {type: 'number', nullable: true, min: 0, max: 32768},
    },
  }),
);

// assert
const input: ResourceMap = {cpu: 1000, memory: 512};
assertResourceMap(input);
```

Violation details example:

```json
[
  {
    "location": "cpu",
    "message": "The value must fall within the range 0 - 8000.",
    "reason": "number range",
    "args": {
      "min": 0,
      "max": 8000
    }
  }
]
```
