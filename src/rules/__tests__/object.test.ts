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
          "location": "a",
          "message": "Required to be greater or equal to 1.",
          "reason": "number min",
        },
        {
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
          "location": "a",
          "message": "Required to be greater or equal to 1.",
          "reason": "number min",
        },
        {
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
});

type Labels = {[key: string]: unknown};// & {x2: string};
type Input = {labels?: Labels};

function cc<T>(rule: Rule<T>, input: unknown) {
  const check = compile(rule);
  const violations: Violation[] = [];
  check(input as T, violations);
  return violations;
}
