import {Builder, RuleBuilder} from '../builder';
import {Rule} from '../types';

export function buildRuleArray<T>(builder: Builder, rule: Rule<T>): string {
  if (rule.type !== 'array') {
    throw new Error(`Unexpected "${rule.type}" rule.`);
  }

  const {min, max, items, nullable} = rule;
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
      if (!Array.isArray(value)) {
        ${builder.addViolation(
          nullable
            ? {
                reason: 'array null',
                message: 'Required to be an array or null.',
              }
            : {
                reason: 'array',
                message: 'Required to be an array.',
              },
        )}
      }`);

  if (min !== undefined) {
    if (min < 0) {
      throw new Error('Negative min array length.');
    }

    if (min > 0) {
      src.push(`
      else if (value.length === 0) {
        ${builder.addViolation({
          reason: 'array empty',
          message: `Required field cannot be left empty.`,
        })}
      }`);
    }

    if (max === undefined) {
      src.push(`
      else if (value.length < ${min}) {
        ${builder.addViolation({
          reason: 'array min',
          message: `Required to be a minimum of ${min} items in length.`,
        })}
      }`);
    } else {
      if (min > max) {
        throw new Error('Array min length is greater than max.');
      }

      if (min === max) {
        src.push(`
      else if (value.length !== ${max}) {
        ${builder.addViolation({
          reason: 'array exact',
          message: `The array length must be exactly ${max} items.`,
        })}
      }`);
      } else {
        src.push(`
      else if (value.length < ${min} || value.length > ${max}) {
        ${builder.addViolation({
          reason: 'array range',
          message: `Required to be between ${min} and ${max} items in length.`,
        })}
      }`);
      }
    }
  } else if (max !== undefined) {
    if (max < 0) {
      throw new Error('Negative max string length.');
    }

    src.push(`
      else if (value.length > ${max}) {
        ${builder.addViolation({
          reason: 'array max',
          message: `Exceeds maximum length of ${max} items.`,
        })}
      }`);
  }

  if (items) {
    const i = `__i${builder.locations.length}`;
    src.push(`
      else {
        const items = value;
        for (let ${i} = 0; ${i} < items.length; ${i}++) {
          const value = items[${i}];
          ${builder.build(items, `\`[\${${i}}]\``)}
        } /* for ${i} */
      }`);
  }

  src.push(`
    }`);

  return src.join('');
}

export const arrayRuleBuilder: RuleBuilder = {
  types: ['array'],
  build: buildRuleArray,
};
