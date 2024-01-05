import {Builder, RuleBuilder} from '../builder';
import {Rule} from '../types';

export function buildRuleBoolean<T>(builder: Builder, rule: Rule<T>): string {
  if (rule.type !== 'boolean') {
    throw new Error(`Unexpected "${rule.type}" rule.`);
  }

  const {nullable} = rule;
  const src: string[] = [];
  if (nullable) {
    src.push(`
    if (value !== undefined && value !== null) {`);
  } else {
    src.push(`
    if (value === null) {
      ${builder.addViolation({
        reason: 'field not null',
        message: 'Required field cannot be null.',
      })}
    }
    else {`);
  }

  src.push(`
      if (typeof value !== "boolean") {
        ${builder.addViolation(
          nullable
            ? {
                reason: 'boolean null',
                message: 'Required to be a boolean or null.',
              }
            : {
                reason: 'boolean',
                message: 'Required to be a boolean.',
              },
        )}
      }
    }`);

  return src.join('');
}

export const booleanRuleBuilder: RuleBuilder = {
  types: ['boolean'],
  build: buildRuleBoolean,
};
