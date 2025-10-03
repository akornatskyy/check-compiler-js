/* eslint-disable unicorn/no-useless-undefined */
import {compile} from '../..';
import {type Builder} from '../../builder';
import {type Rule, type Violation} from '../../types';
import {buildRuleBoolean} from '../boolean';

describe('rule boolean', () => {
  it('unexpected rule', () => {
    const rule = {type: 'string'} as unknown as Rule<boolean>;

    expect(() => buildRuleBoolean({} as Builder, rule)).toThrow(/Unexpected/);
  });

  it('field nullable', () => {
    const rule: Rule<boolean | null> = {type: 'boolean', nullable: true};

    expect(cc(rule, undefined)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, null)).toMatchInlineSnapshot(`[]`);
  });

  it('field not null', () => {
    const rule: Rule<boolean> = {type: 'boolean'};

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

  it('boolean', () => {
    const rule: Rule<boolean> = {type: 'boolean'};

    expect(cc(rule, true)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, undefined)).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to be a boolean.",
          "reason": "boolean",
        },
      ]
    `);
    expect(cc(rule, '')).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to be a boolean.",
          "reason": "boolean",
        },
      ]
    `);
    expect(cc(rule, 1)).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to be a boolean.",
          "reason": "boolean",
        },
      ]
    `);
    expect(cc(rule, Number.NaN)).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to be a boolean.",
          "reason": "boolean",
        },
      ]
    `);

    rule.messages = {boolean: 'custom'};

    expect(cc(rule, '')).toMatchInlineSnapshot(`
      [
        {
          "message": "custom",
          "reason": "boolean",
        },
      ]
    `);
  });

  it('boolean null', () => {
    const rule: Rule<boolean | null> = {type: 'boolean', nullable: true};

    expect(cc(rule, false)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, undefined)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, null)).toMatchInlineSnapshot(`[]`);
    expect(cc(rule, '')).toMatchInlineSnapshot(`
      [
        {
          "message": "Required to be a boolean or null.",
          "reason": "boolean null",
        },
      ]
    `);

    rule.messages = {'boolean null': 'custom'};

    expect(cc(rule, '')).toMatchInlineSnapshot(`
      [
        {
          "message": "custom",
          "reason": "boolean null",
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
