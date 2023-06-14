import {Builder, RuleBuilder} from '../builder';
import {Rule} from '../types';

export function buildRuleString<T>(builder: Builder, rule: Rule<T>): string {
  if (rule.type !== 'string') {
    throw new Error(`Unexpected "${rule.type}" rule.`);
  }

  const {min, max, pattern, nullable} = rule;
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
      if (typeof value !== "string") {
        ${builder.addViolation(
          nullable
            ? {
                reason: 'string null',
                message: 'Required to be a string or null.',
              }
            : {
                reason: 'string',
                message: 'Required to be a string.',
              },
        )}
      }`);

  if (min !== undefined) {
    if (min < 0) {
      throw new Error('Negative min string length.');
    }

    if (min === 1) {
      src.push(`
      else if (value.length === 0) {
        ${builder.addViolation({
          reason: 'string blank',
          message: `Required field cannot be left blank.`,
        })}
      }`);
    }

    if (max === undefined) {
      src.push(`
      else if (value.length < ${min}) {
        ${builder.addViolation({
          reason: 'string min',
          message: `Required to be a minimum of ${min} characters in length.`,
        })}
      }`);
    } else {
      if (min > max) {
        throw new Error('String min length is greater than max.');
      }

      if (min === max) {
        src.push(`
      else if (value.length !== ${max}) {
        ${builder.addViolation({
          reason: 'string exact',
          message: `The length must be exactly ${max} characters.`,
        })}
      }`);
      } else {
        src.push(`
      else if (value.length < ${min} || value.length > ${max}) {
        ${builder.addViolation({
          reason: 'string range',
          message: `Required to be between ${min} and ${max} characters in length.`,
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
          reason: 'string max',
          message: `Exceeds maximum length of ${max} characters.`,
        })}
      }`);
  }

  if (pattern) {
    src.push(`
      else if (!${pattern}.test(value)) {
        ${builder.addViolation({
          reason: 'string pattern',
          message: `Required to match validation pattern.`,
        })}
      }`);
  }

  src.push(`
    }`);

  return src.join('');
}

export const stringRuleBuilder: RuleBuilder = {
  types: ['string'],
  build: buildRuleString,
};
