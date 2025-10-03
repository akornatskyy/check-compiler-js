import {type Builder, type RuleBuilder} from '../builder';
import {type Rule} from '../types';

export function buildRuleArray<T>(builder: Builder, rule: Rule<T>): string {
  if (rule.type !== 'array') {
    throw new Error(`Unexpected "${rule.type}" rule.`);
  }

  const {min, max, items, nullable, messages} = rule;
  const src: string[] = [];
  if (nullable) {
    src.push(`
    if (value !== undefined && value !== null) {`);
  } else {
    src.push(`
    if (value === null) {
      ${builder.addViolation({
        reason: 'field not null',
        message:
          messages?.['field not null'] ?? 'Required field cannot be null.',
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
                message:
                  messages?.['array null'] ??
                  'Required to be an array or null.',
              }
            : {
                reason: 'array',
                message: messages?.array ?? 'Required to be an array.',
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
          message:
            messages?.['array empty'] ?? 'Required field cannot be left empty.',
        })}
      }`);
    }

    if (max === undefined) {
      src.push(`
      else if (value.length < ${min}) {
        ${builder.addViolation({
          reason: 'array min',
          message:
            messages?.['array min']?.replace('{min}', min.toString()) ??
            `Required to be a minimum of ${min} items in length.`,
          args: {min},
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
          message:
            messages?.['array exact']?.replace('{max}', max.toString()) ??
            `The array length must be exactly ${max} items.`,
          args: {max},
        })}
      }`);
      } else {
        src.push(`
      else if (value.length < ${min} || value.length > ${max}) {
        ${builder.addViolation({
          reason: 'array range',
          message:
            messages?.['array range']
              ?.replace('{min}', min.toString())
              .replace('{max}', max.toString()) ??
            `Required to be between ${min} and ${max} items in length.`,
          args: {min, max},
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
          message:
            messages?.['array max']?.replace('{max}', max.toString()) ??
            `Exceeds maximum length of ${max} items.`,
          args: {max},
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
