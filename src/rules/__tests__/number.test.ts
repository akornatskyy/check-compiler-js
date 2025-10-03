/* eslint-disable unicorn/no-useless-undefined */
import {compile} from '../..';
import {type Builder} from '../../builder';
import {type Rule, type Violation} from '../../types';
import {buildRuleNumber} from '../number';

describe('rule number', () => {
  it('unexpected rule', () => {
    const rule = {type: 'string'} as unknown as Rule<number>;

    expect(() => buildRuleNumber({} as Builder, rule)).toThrow(/Unexpected/);
  });

  it('field nullable', () => {
    const rule: Rule<number | null> = {type: 'number', nullable: true};

    expect(cc(rule, undefined)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, null)).toMatchInlineSnapshot(`[]`);
  });

  it('field not null', () => {
    const rule: Rule<number> = {type: 'number'};

    expect(cc(rule, null)).toMatchInlineSnapshot(`
      [
        {
          "message": "Required field cannot be null.",
          "reason": "field not null",
        },
      ]
    `);

    rule.messages = {'field not null': 'custom'};

    expect(cc(rule, null)).toMatchInlineSnapshot(`
      [
        {
          "message": "custom",
          "reason": "field not null",
        },
      ]
    `);
  });

  it('number', () => {
    const rule: Rule<number> = {type: 'number'};

    expect(cc(rule, 1)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, undefined)).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to be a number.",
          "reason": "number",
        },
      ]
    `);
    expect(cc(rule, '')).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to be a number.",
          "reason": "number",
        },
      ]
    `);
    expect(cc(rule, Number.NaN)).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to be a number.",
          "reason": "number",
        },
      ]
    `);

    rule.messages = {number: 'custom'};

    expect(cc(rule, '')).toMatchInlineSnapshot(`
      [
        {
          "message": "custom",
          "reason": "number",
        },
      ]
    `);
  });

  it('number null', () => {
    const rule: Rule<number | null> = {type: 'number', nullable: true};

    expect(cc(rule, 1)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, undefined)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, null)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, '')).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to be a number or null.",
          "reason": "number null",
        },
      ]
    `);

    rule.messages = {'number null': 'custom'};

    expect(cc(rule, '')).toMatchInlineSnapshot(`
      [
        {
          "message": "custom",
          "reason": "number null",
        },
      ]
    `);
  });

  it('integer', () => {
    const rule: Rule<number> = {type: 'integer'};

    expect(cc(rule, 10)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, 1.5)).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to be an integer.",
          "reason": "integer",
        },
      ]
    `);

    rule.messages = {integer: 'custom'};

    expect(cc(rule, 1.5)).toMatchInlineSnapshot(`
      [
        {
          "message": "custom",
          "reason": "integer",
        },
      ]
    `);
  });

  it('number min greater error', () => {
    const rule: Rule<number> = {type: 'number', min: 0, max: -2};

    expect(() => cc(rule, '')).toThrow(/min .+ greater/);
  });

  it('number range', () => {
    const rule: Rule<number> = {type: 'number', min: 1, max: 10};

    expect(cc(rule, 1)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, 10)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, 0)).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "max": 10,
            "min": 1,
          },
          "message": "The value must fall within the range 1 - 10.",
          "reason": "number range",
        },
      ]
    `);
    expect(cc(rule, 11)).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "max": 10,
            "min": 1,
          },
          "message": "The value must fall within the range 1 - 10.",
          "reason": "number range",
        },
      ]
    `);

    rule.messages = {'number range': 'custom {min} {max}'};

    expect(cc(rule, 11)).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "max": 10,
            "min": 1,
          },
          "message": "custom 1 10",
          "reason": "number range",
        },
      ]
    `);
  });

  it('number positive', () => {
    const rule: Rule<number> = {type: 'number', min: 0};

    expect(cc(rule, 2)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, -1)).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to be a positive number.",
          "reason": "number positive",
        },
      ]
    `);

    rule.messages = {'number positive': 'custom'};

    expect(cc(rule, -1)).toMatchInlineSnapshot(`
      [
        {
          "message": "custom",
          "reason": "number positive",
        },
      ]
    `);
  });

  it('number min', () => {
    const rule: Rule<number> = {type: 'number', min: 1};

    expect(cc(rule, 2)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, 0)).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "min": 1,
          },
          "message": "Required to be greater or equal to 1.",
          "reason": "number min",
        },
      ]
    `);

    rule.messages = {'number min': 'custom {min}'};

    expect(cc(rule, -1)).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "min": 1,
          },
          "message": "custom 1",
          "reason": "number min",
        },
      ]
    `);
  });

  it('number max', () => {
    const rule: Rule<number> = {type: 'number', max: 10};

    expect(cc(rule, 9)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, 11)).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "max": 10,
          },
          "message": "Exceeds maximum allowed value of 10.",
          "reason": "number max",
        },
      ]
    `);

    rule.messages = {'number max': 'custom {max}'};

    expect(cc(rule, 11)).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "max": 10,
          },
          "message": "custom 10",
          "reason": "number max",
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
