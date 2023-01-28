import {Builder, RuleBuilder} from '../builder';
import {Rule} from '../types';

export function buildRuleNumber<T>(builder: Builder, rule: Rule<T>): string {
  if (rule.type !== 'number' && rule.type !== 'integer') {
    throw new Error(`Unexpected "${rule.type}" rule.`);
  }

  const {min, max, nullable} = rule;
  const src: string[] = [];
  if (!nullable) {
    src.push(`
    if (value === null) {
      ${builder.addViolation({
        reason: 'field not null',
        message: 'Required field cannot be null.',
      })}
    }
    else {`);
  } else {
    src.push(`
    if (value !== undefined && value !== null) {`);
  }

  src.push(`
      if (typeof value !== "number" || isNaN(value)) {
        ${builder.addViolation(
          nullable
            ? {
                reason: 'number null',
                message: 'Required to be a number or null.',
              }
            : {
                reason: 'number',
                message: 'Required to be a number.',
              },
        )}
      }`);

  if (rule.type === 'integer') {
    src.push(`
      else if (value % 1 !== 0) {
        ${builder.addViolation({
          reason: 'integer',
          message: `Required to be an integer.`,
        })}
      }`);
  }

  if (min !== undefined) {
    if (max !== undefined) {
      if (min > max) {
        throw new Error('Number min is greater than max.');
      }

      src.push(`
      else if (value < ${min} || value > ${max}) {
        ${builder.addViolation({
          reason: 'number range',
          message: `The value must fall within the range ${min} - ${max}.`,
        })}
      }`);
    } else {
      if (min === 0) {
        src.push(`
      else if (value < ${min}) {
        ${builder.addViolation({
          reason: 'number positive',
          message: `Required to be a positive number.`,
        })}
      }`);
      } else {
        src.push(`
      else if (value < ${min}) {
        ${builder.addViolation({
          reason: 'number min',
          message: `Required to be greater or equal to ${min}.`,
        })}
      }`);
      }
    }
  } else if (max !== undefined) {
    src.push(`
    else if (value > ${max}) {
      ${builder.addViolation({
        reason: 'number max',
        message: `Exceeds maximum allowed value of ${max}.`,
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
