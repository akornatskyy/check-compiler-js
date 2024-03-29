/* eslint-disable unicorn/no-null */
/* eslint-disable unicorn/no-useless-undefined */
import {compile} from '../..';
import {Builder} from '../../builder';
import {Rule, Violation} from '../../types';
import {buildRuleString} from '../string';

describe('rule string', () => {
  it('unexpected rule', () => {
    const rule = {type: 'number'} as unknown as Rule<string>;

    expect(() => buildRuleString({} as Builder, rule)).toThrow(/Unexpected/);
  });

  it('field nullable', () => {
    const rule: Rule<string | null> = {type: 'string', nullable: true};

    expect(cc(rule, undefined)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, null)).toMatchInlineSnapshot(`[]`);
  });

  it('field not null', () => {
    const rule: Rule<string> = {type: 'string'};

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

  it('string', () => {
    const rule: Rule<string> = {type: 'string'};

    expect(cc(rule, '')).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, undefined)).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to be a string.",
          "reason": "string",
        },
      ]
    `);
    expect(cc(rule, 1)).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to be a string.",
          "reason": "string",
        },
      ]
    `);

    rule.messages = {'string': 'custom'};

    expect(cc(rule, 1)).toMatchInlineSnapshot(`
      [
        {
          "message": "custom",
          "reason": "string",
        },
      ]
    `);
  });

  it('string null', () => {
    const rule: Rule<string | null> = {type: 'string', nullable: true};

    expect(cc(rule, '')).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, undefined)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, null)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, 1)).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to be a string or null.",
          "reason": "string null",
        },
      ]
    `);

    rule.messages = {'string null': 'custom'};

    expect(cc(rule, 1)).toMatchInlineSnapshot(`
      [
        {
          "message": "custom",
          "reason": "string null",
        },
      ]
    `);
  });

  it('string min negative error', () => {
    const rule: Rule<string> = {type: 'string', min: -2};

    expect(() => cc(rule, '')).toThrow(/Negative min/);
  });

  it('string blank', () => {
    const rule: Rule<string> = {type: 'string', min: 2};

    expect(cc(rule, 'ab')).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, '')).toMatchInlineSnapshot(`
      [
        {
          "message": "Required field cannot be left blank.",
          "reason": "string blank",
        },
      ]
    `);

    rule.messages = {'string blank': 'custom'};

    expect(cc(rule, '')).toMatchInlineSnapshot(`
      [
        {
          "message": "custom",
          "reason": "string blank",
        },
      ]
    `);
  });

  it('string blank when min equals one', () => {
    const rule: Rule<string> = {type: 'string', min: 1};

    expect(cc(rule, 'a')).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, '')).toMatchInlineSnapshot(`
      [
        {
          "message": "Required field cannot be left blank.",
          "reason": "string blank",
        },
      ]
    `);

    rule.messages = {'string blank': 'custom'};

    expect(cc(rule, '')).toMatchInlineSnapshot(`
      [
        {
          "message": "custom",
          "reason": "string blank",
        },
      ]
    `);
  });

  it('string min greater error', () => {
    const rule: Rule<string> = {type: 'string', min: 0, max: -2};

    expect(() => cc(rule, '')).toThrow(/min .+ greater/);
  });

  it('string exact', () => {
    const rule: Rule<string> = {type: 'string', min: 2, max: 2};

    expect(cc(rule, 'ab')).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, 'a')).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "max": 2,
          },
          "message": "The length must be exactly 2 characters.",
          "reason": "string exact",
        },
      ]
    `);

    rule.messages = {'string exact': 'custom {max}'};

    expect(cc(rule, 'a')).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "max": 2,
          },
          "message": "custom 2",
          "reason": "string exact",
        },
      ]
    `);
  });

  it('string range', () => {
    const rule: Rule<string> = {type: 'string', min: 2, max: 4};

    expect(cc(rule, 'ab')).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, 'abcd')).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, 'a')).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "max": 4,
            "min": 2,
          },
          "message": "Required to be between 2 and 4 characters in length.",
          "reason": "string range",
        },
      ]
    `);
    expect(cc(rule, 'abcde')).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "max": 4,
            "min": 2,
          },
          "message": "Required to be between 2 and 4 characters in length.",
          "reason": "string range",
        },
      ]
    `);

    rule.messages = {'string range': 'custom {min} {max}'};

    expect(cc(rule, 'a')).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "max": 4,
            "min": 2,
          },
          "message": "custom 2 4",
          "reason": "string range",
        },
      ]
    `);
  });

  it('string min', () => {
    const rule: Rule<string> = {type: 'string', min: 2};

    expect(cc(rule, 'ab')).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, 'a')).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "min": 2,
          },
          "message": "Required to be a minimum of 2 characters in length.",
          "reason": "string min",
        },
      ]
    `);

    rule.messages = {'string min': 'custom {min}'};

    expect(cc(rule, 'a')).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "min": 2,
          },
          "message": "custom 2",
          "reason": "string min",
        },
      ]
    `);
  });

  it('string max negative error', () => {
    const rule: Rule<string> = {type: 'string', max: -2};

    expect(() => cc(rule, '')).toThrow(/Negative max/);
  });

  it('string max', () => {
    const rule: Rule<string> = {type: 'string', max: 3};

    expect(cc(rule, 'abc')).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, 'abcd')).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "max": 3,
          },
          "message": "Exceeds maximum length of 3 characters.",
          "reason": "string max",
        },
      ]
    `);

    rule.messages = {'string max': 'custom {max}'};

    expect(cc(rule, 'abcd')).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "max": 3,
          },
          "message": "custom 3",
          "reason": "string max",
        },
      ]
    `);
  });

  it('string pattern', () => {
    const rule: Rule<string> = {type: 'string', pattern: /[a-z]+/};

    expect(cc(rule, 'abc')).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, '1234')).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to match validation pattern.",
          "reason": "string pattern",
        },
      ]
    `);

    rule.messages = {'string pattern': 'custom'};

    expect(cc(rule, '1234')).toMatchInlineSnapshot(`
      [
        {
          "message": "custom",
          "reason": "string pattern",
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
