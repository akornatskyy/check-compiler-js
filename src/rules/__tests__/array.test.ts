/* eslint-disable unicorn/no-null */
/* eslint-disable unicorn/no-useless-undefined */
import {compile} from '../..';
import {Builder} from '../../builder';
import {Rule, Violation} from '../../types';
import {buildRuleArray} from '../array';

describe('rule array', () => {
  it('unexpected rule', () => {
    const rule = {type: 'string'} as unknown as Rule<string[]>;

    expect(() => buildRuleArray({} as Builder, rule)).toThrow(/Unexpected/);
  });

  it('field nullable', () => {
    const rule: Rule<number[] | null> = {
      type: 'array',
      items: {type: 'number'},
      nullable: true,
    };

    expect(cc(rule, undefined)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, null)).toMatchInlineSnapshot(`[]`);
  });

  it('field not null', () => {
    const rule: Rule<number[]> = {type: 'array', items: {type: 'number'}};

    expect(cc(rule, null)).toMatchInlineSnapshot(`
      [
        {
          "message": "Required field cannot be null.",
          "reason": "field not null",
        },
      ]
    `);
  });

  it('array', () => {
    const rule: Rule<number[]> = {type: 'array', items: {type: 'number'}};

    expect(cc(rule, [1])).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, undefined)).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to be an array.",
          "reason": "array",
        },
      ]
    `);
    expect(cc(rule, '')).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to be an array.",
          "reason": "array",
        },
      ]
    `);
  });

  it('array null', () => {
    const rule: Rule<number[] | null> = {
      type: 'array',
      items: {type: 'number'},
      nullable: true,
    };

    expect(cc(rule, [1])).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, undefined)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, null)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, '')).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to be an array or null.",
          "reason": "array null",
        },
      ]
    `);
  });

  it('array min negative error', () => {
    const rule: Rule<number[]> = {
      type: 'array',
      items: {type: 'number'},
      min: -2,
    };

    expect(() => cc(rule, [])).toThrow(/Negative min/);
  });

  it('array empty', () => {
    const rule: Rule<number[]> = {
      type: 'array',
      items: {type: 'number'},
      min: 1,
    };

    expect(cc(rule, [1])).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, [])).toMatchInlineSnapshot(`
      [
        {
          "message": "Required field cannot be left empty.",
          "reason": "array empty",
        },
      ]
    `);
  });

  it('array min greater error', () => {
    const rule: Rule<number[]> = {
      type: 'array',
      items: {type: 'number'},
      min: 0,
      max: -2,
    };

    expect(() => cc(rule, '')).toThrow(/min .+ greater/);
  });

  it('array exact', () => {
    const rule: Rule<number[]> = {
      type: 'array',
      items: {type: 'number'},
      min: 2,
      max: 2,
    };

    expect(cc(rule, [1, 2])).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, [1])).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "max": 2,
          },
          "message": "The array length must be exactly 2 items.",
          "reason": "array exact",
        },
      ]
    `);
  });

  it('array range', () => {
    const rule: Rule<number[]> = {
      type: 'array',
      items: {type: 'number'},
      min: 2,
      max: 4,
    };

    expect(cc(rule, [1, 2])).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, [1, 2, 3, 4])).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, [1])).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "max": 4,
            "min": 2,
          },
          "message": "Required to be between 2 and 4 items in length.",
          "reason": "array range",
        },
      ]
    `);
    expect(cc(rule, [1, 2, 3, 4, 5])).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "max": 4,
            "min": 2,
          },
          "message": "Required to be between 2 and 4 items in length.",
          "reason": "array range",
        },
      ]
    `);
  });

  it('array min', () => {
    const rule: Rule<number[]> = {
      type: 'array',
      items: {type: 'number'},
      min: 2,
    };

    expect(cc(rule, [1, 2])).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, [1])).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "min": 2,
          },
          "message": "Required to be a minimum of 2 items in length.",
          "reason": "array min",
        },
      ]
    `);
  });

  it('array max negative error', () => {
    const rule: Rule<number[]> = {
      type: 'array',
      items: {type: 'number'},
      max: -2,
    };

    expect(() => cc(rule, '')).toThrow(/Negative max/);
  });

  it('array max', () => {
    const rule: Rule<number[]> = {
      type: 'array',
      items: {type: 'number'},
      max: 3,
    };

    expect(cc(rule, [1, 2, 3])).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, [1, 2, 3, 4])).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "max": 3,
          },
          "message": "Exceeds maximum length of 3 items.",
          "reason": "array max",
        },
      ]
    `);
  });

  it('array items', () => {
    const rule: Rule<number[]> = {
      type: 'array',
      items: {type: 'number', min: 0},
    };

    expect(cc(rule, [1, 2, 3])).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, [-1, -2])).toMatchInlineSnapshot(`
      [
        {
          "location": "[0]",
          "message": "Required to be a positive number.",
          "reason": "number positive",
        },
        {
          "location": "[1]",
          "message": "Required to be a positive number.",
          "reason": "number positive",
        },
      ]
    `);
  });
});

function cc<T>(rule: Rule<T>, input: unknown) {
  const check = compile(rule);
  const violations: Violation[] = [];
  check(input as T, violations);
  return violations;
}
