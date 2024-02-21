/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable unicorn/no-null */
/* eslint-disable unicorn/no-useless-undefined */
import {compile} from '../..';
import {Builder} from '../../builder';
import {Rule, Violation} from '../../types';
import {buildRuleObject} from '../object';

describe('rule object', () => {
  it('unexpected rule', () => {
    const rule = {type: 'string'} as unknown as Rule<{}>;

    expect(() => buildRuleObject({} as Builder, rule)).toThrow(/Unexpected/);
  });

  it('nullable', () => {
    const rule: Rule<{} | null> = {
      type: 'object',
      nullable: true,
    };

    expect(cc(rule, undefined)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, null)).toMatchInlineSnapshot(`[]`);
  });

  it('object not null', () => {
    const rule: Rule<{}> = {type: 'object'};

    expect(cc(rule, null)).toMatchInlineSnapshot(`
      [
        {
          "message": "Required object cannot be null.",
          "reason": "object not null",
        },
      ]
    `);
  });

  it('object', () => {
    const rule: Rule<{}> = {type: 'object'};

    expect(cc(rule, {})).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, undefined)).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to be an object.",
          "reason": "object",
        },
      ]
    `);
    expect(cc(rule, 1)).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to be an object.",
          "reason": "object",
        },
      ]
    `);
  });

  it('object null', () => {
    const rule: Rule<{} | null> = {
      type: 'object',
      nullable: true,
    };

    expect(cc(rule, {})).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, undefined)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, null)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, 1)).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to be an object or null.",
          "reason": "object null",
        },
      ]
    `);
  });

  it('required', () => {
    const rule: Rule<{
      a: number;
      b: number | null;
      c?: number;
      d?: number | null;
    }> = {
      type: 'object',
      properties: {
        a: {type: 'integer'},
        b: {type: 'number', nullable: true},
        c: {type: 'integer'},
        d: {type: 'number', nullable: true},
      },
      required: ['a', 'b'],
    };

    expect(cc(rule, {})).toMatchInlineSnapshot(`
      [
        {
          "location": "a",
          "message": "Required field cannot be left blank.",
          "reason": "required",
        },
        {
          "location": "b",
          "message": "Required field cannot be left blank.",
          "reason": "required",
        },
      ]
    `);
  });

  it('required properties', () => {
    const rule: Rule<{a: number; b: number | null}> = {
      type: 'object',
      properties: {
        a: {type: 'integer', min: 1},
        b: {type: 'number', nullable: true, min: 2},
      },
      required: ['a', 'b'],
    };

    expect(cc(rule, {a: 1, b: 2})).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, {a: 0, b: 1})).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "min": 1,
          },
          "location": "a",
          "message": "Required to be greater or equal to 1.",
          "reason": "number min",
        },
        {
          "args": {
            "min": 2,
          },
          "location": "b",
          "message": "Required to be greater or equal to 2.",
          "reason": "number min",
        },
      ]
    `);
  });

  it('optional properties', () => {
    const rule: Rule<{a?: number; b?: number | null}> = {
      type: 'object',
      properties: {
        a: {type: 'integer', min: 1},
        b: {type: 'number', nullable: true, min: 2},
      },
    };

    expect(cc(rule, {a: 1, b: 2})).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, {a: 0, b: 1})).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "min": 1,
          },
          "location": "a",
          "message": "Required to be greater or equal to 1.",
          "reason": "number min",
        },
        {
          "args": {
            "min": 2,
          },
          "location": "b",
          "message": "Required to be greater or equal to 2.",
          "reason": "number min",
        },
      ]
    `);
  });

  it('undefined/null with required', () => {
    const rule: Rule<{a: number; b: number | null}> = {
      type: 'object',
      properties: {
        a: {type: 'integer', min: 1},
        b: {type: 'number', nullable: true, min: 2},
      },
      required: ['a', 'b'],
    };

    expect(cc(rule, {a: 1, b: 2})).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, {})).toMatchInlineSnapshot(`
      [
        {
          "location": "a",
          "message": "Required field cannot be left blank.",
          "reason": "required",
        },
        {
          "location": "b",
          "message": "Required field cannot be left blank.",
          "reason": "required",
        },
      ]
    `);
    expect(cc(rule, {a: null, b: null})).toMatchInlineSnapshot(`
      [
        {
          "location": "a",
          "message": "Required field cannot be null.",
          "reason": "field not null",
        },
      ]
    `);
  });

  it('undefined/null with no required', () => {
    const rule: Rule<{a: number; b: number | null}> = {
      type: 'object',
      properties: {
        a: {type: 'integer', min: 1},
        b: {type: 'number', nullable: true, min: 2},
      },
      required: [],
    };

    expect(cc(rule, {a: 1, b: 2})).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, {})).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, {a: null, b: null})).toMatchInlineSnapshot(`
      [
        {
          "location": "a",
          "message": "Required field cannot be null.",
          "reason": "field not null",
        },
      ]
    `);
  });

  it('undefined/null with optional', () => {
    const rule: Rule<{a?: number; b?: number | null}> = {
      type: 'object',
      properties: {
        a: {type: 'integer', min: 1},
        b: {type: 'number', nullable: true, min: 2},
      },
    };

    expect(cc(rule, {a: 1, b: 2})).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, {})).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, {a: null, b: null})).toMatchInlineSnapshot(`
      [
        {
          "location": "a",
          "message": "Required field cannot be null.",
          "reason": "field not null",
        },
      ]
    `);
  });

  it('value property', () => {
    const rule: Rule<{value?: number}> = {
      type: 'object',
      properties: {
        value: {type: 'integer', min: 1},
      },
    };

    expect(cc(rule, {value: 1})).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, {value: 0})).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "min": 1,
          },
          "location": "value",
          "message": "Required to be greater or equal to 1.",
          "reason": "number min",
        },
      ]
    `);
  });

  it('keyword property', () => {
    const rule: Rule<{in: number[]}> = {
      type: 'object',
      properties: {
        in: {type: 'array', items: {type: 'integer'}},
      },
      required: ['in'],
    };

    expect(cc(rule, {in: [1]})).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, {})).toMatchInlineSnapshot(`
      [
        {
          "location": "in",
          "message": "Required field cannot be left blank.",
          "reason": "required",
        },
      ]
    `);
  });

  it('min properties', () => {
    const rule: Rule<Input> = {
      type: 'object',
      properties: {
        labels: {
          type: 'object',
          patternProperties: {
            '^s': {type: 'string'},
          },
          minProperties: 1,
        },
      },
    };

    expect(cc(rule, {labels: {}})).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "minProperties": 1,
          },
          "location": "labels",
          "message": "The number of object properties must be greater or equal to 1.",
          "reason": "pattern object min properties",
        },
      ]
    `);
    expect(cc(rule, {labels: {s: ''}})).toMatchInlineSnapshot(`[]`);
  });

  it('min properties negative', () => {
    const rule: Rule<Labels> = {type: 'object', minProperties: -1};

    expect(() => cc(rule, {})).toThrow(/min/);
  });

  it('max properties', () => {
    const rule: Rule<Input> = {
      type: 'object',
      properties: {
        labels: {
          type: 'object',
          patternProperties: {
            '^s': {type: 'string'},
          },
          maxProperties: 1,
        },
      },
    };

    expect(cc(rule, {labels: {s1: '', s2: ''}})).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "maxProperties": 1,
          },
          "location": "labels",
          "message": "Exceeds maximum number of allowed object properties 1.",
          "reason": "pattern object max properties",
        },
      ]
    `);
    expect(cc(rule, {labels: {}})).toMatchInlineSnapshot(`[]`);
  });

  it('max properties negative', () => {
    const rule: Rule<Labels> = {type: 'object', maxProperties: -1};

    expect(() => cc(rule, {})).toThrow(/max/);
  });

  it('min max properties', () => {
    const rule: Rule<Input> = {
      type: 'object',
      properties: {
        labels: {
          type: 'object',
          patternProperties: {
            '^s': {type: 'string'},
          },
          minProperties: 1,
          maxProperties: 2,
        },
      },
    };

    expect(cc(rule, {labels: {}})).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "minProperties": 1,
          },
          "location": "labels",
          "message": "The number of object properties must be greater or equal to 1.",
          "reason": "pattern object min properties",
        },
      ]
    `);
    expect(cc(rule, {labels: {s1: '', s2: '', s3: ''}})).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "maxProperties": 2,
          },
          "location": "labels",
          "message": "Exceeds maximum number of allowed object properties 2.",
          "reason": "pattern object max properties",
        },
      ]
    `);
    expect(cc(rule, {labels: {s2: ''}})).toMatchInlineSnapshot(`[]`);
  });

  it('max properties greater max', () => {
    const rule: Rule<Labels> = {
      type: 'object',
      minProperties: 1,
      maxProperties: 0,
    };

    expect(() => cc(rule, {})).toThrow(/min.+greater/);
  });

  it('pattern properties nested', () => {
    const rule: Rule<Input> = {
      type: 'object',
      properties: {
        labels: {
          type: 'object',
          patternProperties: {
            '^s': {type: 'string', min: 1},
          },
        },
      },
    };

    expect(cc(rule, {labels: {s1: ''}})).toMatchInlineSnapshot(`
      [
        {
          "location": "labels["s1"]",
          "message": "Required field cannot be left blank.",
          "reason": "string blank",
        },
      ]
    `);
    expect(cc(rule, {labels: {s: 'x'}})).toMatchInlineSnapshot(`[]`);
  });

  it('additional properties', () => {
    const rule: Rule<{name: string; age: number}> = {
      type: 'object',
      properties: {
        name: {type: 'string'},
        age: {type: 'number'},
      },
      required: ['name'],
      additionalProperties: false,
    };

    expect(cc(rule, {name: 'a', x: '123'})).toMatchInlineSnapshot(`
      [
        {
          "location": "["x"]",
          "message": "Required to not have any additional properties.",
          "reason": "object no additional properties",
        },
      ]
    `);
    expect(cc(rule, {name: 'a', age: 45, x: '123'})).toMatchInlineSnapshot(`
      [
        {
          "location": "["x"]",
          "message": "Required to not have any additional properties.",
          "reason": "object no additional properties",
        },
      ]
    `);
    expect(cc(rule, {name: 'a'})).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, {name: 'a', age: 45})).toMatchInlineSnapshot(`[]`);
  });

  it('additional properties with value property', () => {
    const rule: Rule<{name: string; value: string}> = {
      type: 'object',
      properties: {
        name: {type: 'string'},
        value: {type: 'string'},
      },
      required: ['name'],
      additionalProperties: false,
    };

    expect(cc(rule, {name: 'a', x: 1})).toMatchInlineSnapshot(`
      [
        {
          "location": "["x"]",
          "message": "Required to not have any additional properties.",
          "reason": "object no additional properties",
        },
      ]
    `);
    expect(cc(rule, {name: 'a', value: '1', x: 1})).toMatchInlineSnapshot(`
      [
        {
          "location": "["x"]",
          "message": "Required to not have any additional properties.",
          "reason": "object no additional properties",
        },
      ]
    `);
    expect(cc(rule, {name: 'a'})).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, {name: 'a', value: 'abc'})).toMatchInlineSnapshot(`[]`);
  });

  it('additional properties nested with value property', () => {
    const rule: Rule<{name: string; value: {a: number}}> = {
      type: 'object',
      properties: {
        name: {type: 'string'},
        value: {
          type: 'object',
          properties: {
            a: {type: 'number'},
          },
          required: [],
          additionalProperties: false,
        },
      },
      required: ['name'],
    };

    expect(cc(rule, {name: 'a', value: {x: 1}})).toMatchInlineSnapshot(`
      [
        {
          "location": "value["x"]",
          "message": "Required to not have any additional properties.",
          "reason": "object no additional properties",
        },
      ]
    `);
    expect(cc(rule, {name: 'a', value: {a: 1, x: 2}})).toMatchInlineSnapshot(`
      [
        {
          "location": "value["x"]",
          "message": "Required to not have any additional properties.",
          "reason": "object no additional properties",
        },
      ]
    `);
    expect(cc(rule, {name: 'a'})).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, {name: 'a', x: 1})).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, {name: 'a', value: {a: 1}})).toMatchInlineSnapshot(`[]`);
  });

  it('additional properties with object', () => {
    const rule: Rule<Input> = {
      type: 'object',
      properties: {
        labels: {
          type: 'object',
        },
      },
      additionalProperties: false,
    };

    expect(cc(rule, {x: 1})).toMatchInlineSnapshot(`
      [
        {
          "location": "["x"]",
          "message": "Required to not have any additional properties.",
          "reason": "object no additional properties",
        },
      ]
    `);
    expect(cc(rule, {labels: {s: '', x: 1}})).toMatchInlineSnapshot(`[]`);
  });

  it('additional properties with pattern properties', () => {
    const rule: Rule<Input> = {
      type: 'object',
      properties: {
        labels: {
          type: 'object',
          patternProperties: {
            '^s': {type: 'string'},
          },
          additionalProperties: false,
        },
      },
    };

    expect(cc(rule, {labels: {s: '', x: ''}})).toMatchInlineSnapshot(`
      [
        {
          "location": "labels["x"]",
          "message": "Required to not have any additional properties.",
          "reason": "object no additional properties",
        },
      ]
    `);
    expect(cc(rule, {labels: {s: ''}})).toMatchInlineSnapshot(`[]`);
  });
});

type Labels = {[key: string]: unknown}; // & {x2: string};
type Input = {labels?: Labels};

function cc<T>(rule: Rule<T>, input: unknown) {
  const check = compile(rule);
  const violations: Violation[] = [];
  check(input as T, violations);
  return violations;
}
