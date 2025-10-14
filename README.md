# check-compiler-js

[![tests](https://github.com/akornatskyy/check-compiler-js/actions/workflows/tests.yml/badge.svg)](https://github.com/akornatskyy/check-compiler-js/actions/workflows/tests.yml) [![npm version](https://badge.fury.io/js/check-compiler.svg)](https://www.npmjs.com/package/check-compiler)

A TypeScript-first schema rule compiler and validation library.

## Features

- Zero dependencies
- Type-safe schema definitions with full TypeScript inference
- Works in Node.js and browsers
- Tiny bundle size ([minified+gzipped](https://bundlephobia.com/package/check-compiler))
- Composable and reusable schema definitions
- Custom error messages per validation rule
- Support for nullable types and optional properties

## Install

```sh
npm install check-compiler
```

## Usage

### String Schema

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

### Object Schema

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

### Validation with Exceptions

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

## Supported Types

The library supports comprehensive validation for the following TypeScript types:

### Boolean

```ts
const rule: Rule<boolean> = {
  type: 'boolean',
  nullable: false, // optional
  messages: {
    'field not null': 'Custom message',
    'boolean': 'Must be a boolean value',
  },
};
```

### Number & Integer

```ts
const rule: Rule<number> = {
  type: 'number', // or 'integer'
  nullable: false, // optional
  min: 0, // optional
  max: 100, // optional
  messages: {
    'number': 'Must be a number',
    'integer': 'Must be an integer',
    'number range': 'Must be between {min} and {max}',
  },
};
```

### String

```ts
const rule: Rule<string> = {
  type: 'string',
  nullable: false, // optional
  min: 1, // minimum length, optional
  max: 255, // maximum length, optional
  pattern: /^[a-z]+$/, // regex pattern, optional
  messages: {
    'string': 'Must be a string',
    'string min': 'Must be at least {min} characters',
    'string pattern': 'Must match pattern',
  },
};
```

### Array

```ts
const rule: Rule<number[]> = {
  type: 'array',
  items: {type: 'number', min: 0},
  nullable: false, // optional
  min: 1, // minimum array length, optional
  max: 10, // maximum array length, optional
  messages: {
    'array': 'Must be an array',
    'array min': 'Must contain at least {min} items',
  },
};
```

### Object

```ts
type User = {
  name: string;
  age?: number;
};

const rule: Rule<User> = {
  type: 'object',
  nullable: false, // optional
  properties: {
    name: {type: 'string', min: 1},
    age: {type: 'number', nullable: true, min: 0},
  },
  required: ['name'], // optional
  additionalProperties: false, // optional, disallow unknown properties
  minProperties: 1, // optional
  maxProperties: 10, // optional
  patternProperties: { // optional, for dynamic keys
    '^[a-z]+$': {type: 'string'},
  },
};
```

## API Reference

### `compile<T>(rule: Rule<T>): Check<T>`

Compiles a rule definition into a validation function.

- **Parameters:**
  - `rule`: The validation rule definition
- **Returns:** A `Check<T>` function that validates input

### `Check<T>`

Type definition for the compiled validation function.

```ts
type Check<T> = (input: T, violations: Violation[]) => void;
```

- **Parameters:**
  - `input`: The value to validate
  - `violations`: An array that will be populated with any validation errors

### `Violation`

Structure of validation error objects:

```ts
type Violation = {
  reason: string; // Machine-readable error type
  message: string; // Human-readable error message
  location?: string; // Property path (e.g., 'user.email')
  args?: {[key: string]: unknown}; // Additional context
};
```

### Violation Details Example

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
