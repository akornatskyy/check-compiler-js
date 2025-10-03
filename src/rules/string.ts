import {type Builder, type RuleBuilder} from '../builder';
import {type Rule} from '../types';

export function buildRuleString<T>(builder: Builder, rule: Rule<T>): string {
  if (rule.type !== 'string') {
    throw new Error(`Unexpected "${rule.type}" rule.`);
  }

  const {min, max, pattern, nullable, messages} = rule;
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
      if (typeof value !== "string") {
        ${builder.addViolation(
          nullable
            ? {
                reason: 'string null',
                message:
                  messages?.['string null'] ??
                  'Required to be a string or null.',
              }
            : {
                reason: 'string',
                message: messages?.['string'] ?? 'Required to be a string.',
              },
        )}
      }`);

  if (min !== undefined) {
    if (min < 0) {
      throw new Error('Negative min string length.');
    }

    if (min > 0) {
      src.push(`
      else if (value.length === 0) {
        ${builder.addViolation({
          reason: 'string blank',
          message:
            messages?.['string blank'] ??
            'Required field cannot be left blank.',
        })}
      }`);
    }

    if (max === undefined) {
      src.push(`
      else if (value.length < ${min}) {
        ${builder.addViolation({
          reason: 'string min',
          message:
            messages?.['string min']?.replace('{min}', min.toString()) ??
            `Required to be a minimum of ${min} characters in length.`,
          args: {min},
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
          message:
            messages?.['string exact']?.replace('{max}', max.toString()) ??
            `The length must be exactly ${max} characters.`,
          args: {max},
        })}
      }`);
      } else {
        src.push(`
      else if (value.length < ${min} || value.length > ${max}) {
        ${builder.addViolation({
          reason: 'string range',
          message:
            messages?.['string range']
              ?.replace('{min}', min.toString())
              .replace('{max}', max.toString()) ??
            `Required to be between ${min} and ${max} characters in length.`,
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
          reason: 'string max',
          message:
            messages?.['string max']?.replace('{max}', max.toString()) ??
            `Exceeds maximum length of ${max} characters.`,
          args: {max},
        })}
      }`);
  }

  if (pattern) {
    src.push(`
      else if (!${pattern}.test(value)) {
        ${builder.addViolation({
          reason: 'string pattern',
          message:
            messages?.['string pattern'] ??
            'Required to match validation pattern.',
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
