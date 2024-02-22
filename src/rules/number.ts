import {Builder, RuleBuilder} from '../builder';
import {Rule} from '../types';

export function buildRuleNumber<T>(builder: Builder, rule: Rule<T>): string {
  if (rule.type !== 'number' && rule.type !== 'integer') {
    throw new Error(`Unexpected "${rule.type}" rule.`);
  }

  const {min, max, nullable, messages} = rule;
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
      if (typeof value !== "number" || isNaN(value)) {
        ${builder.addViolation(
          nullable
            ? {
                reason: 'number null',
                message:
                  messages?.['number null'] ??
                  'Required to be a number or null.',
              }
            : {
                reason: 'number',
                message: messages?.['number'] ?? 'Required to be a number.',
              },
        )}
      }`);

  if (rule.type === 'integer') {
    src.push(`
      else if (value % 1 !== 0) {
        ${builder.addViolation({
          reason: 'integer',
          message: messages?.['integer'] ?? 'Required to be an integer.',
        })}
      }`);
  }

  if (min !== undefined) {
    if (max === undefined) {
      if (min === 0) {
        src.push(`
      else if (value < ${min}) {
        ${builder.addViolation({
          reason: 'number positive',
          message:
            messages?.['number positive'] ??
            'Required to be a positive number.',
        })}
      }`);
      } else {
        src.push(`
      else if (value < ${min}) {
        ${builder.addViolation({
          reason: 'number min',
          message:
            messages?.['number min']?.replace('{min}', min.toString()) ??
            `Required to be greater or equal to ${min}.`,
          args: {min},
        })}
      }`);
      }
    } else {
      if (min > max) {
        throw new Error('Number min is greater than max.');
      }

      src.push(`
      else if (value < ${min} || value > ${max}) {
        ${builder.addViolation({
          reason: 'number range',
          message:
            messages?.['number range']
              ?.replace('{min}', min.toString())
              .replace('{max}', max.toString()) ??
            `The value must fall within the range ${min} - ${max}.`,
          args: {min, max},
        })}
      }`);
    }
  } else if (max !== undefined) {
    src.push(`
    else if (value > ${max}) {
      ${builder.addViolation({
        reason: 'number max',
        message:
          messages?.['number max']?.replace('{max}', max.toString()) ??
          `Exceeds maximum allowed value of ${max}.`,
        args: {max},
      })}
    }`);
  }

  src.push(`
    }`);

  return src.join('');
}

export const numberRuleBuilder: RuleBuilder = {
  types: ['number', 'integer'],
  build: buildRuleNumber,
};
