import {Builder, RuleBuilder} from '../builder';
import {Rule} from '../types';

export function buildRuleObject<T>(builder: Builder, rule: Rule<T>): string {
  if (rule.type !== 'object') {
    throw new Error(`Unexpected "${rule.type}" rule.`);
  }

  const {properties, required, nullable} = rule;
  const src: string[] = [];
  if (nullable) {
    src.push(`
    if (value !== undefined && value !== null) {`);
  } else {
    src.push(`
    if (value === null) {
      ${builder.addViolation({
        reason: 'object not null',
        message: 'Required object cannot be null.',
      })}
    }
    else {`);
  }

  src.push(`
      const __o = value;
      if (typeof value !== "object") {
        ${builder.addViolation(
          nullable
            ? {
                reason: 'object null',
                message: 'Required to be an object or null.',
              }
            : {
                reason: 'object',
                message: 'Required to be an object.',
              },
        )}
      }
      else {
        const {${Object.keys(properties).join(', ')}} = __o;`);

  if (required) {
    src.push(`
        let ok = true;`);
    for (const r of required) {
      const name = String(r);
      src.push(`
        if (${name} === undefined || ${name} === null) {
          ok = false;
          ${builder.addViolation({
            location: name,
            reason: 'required',
            message: 'Required field cannot be left blank.',
          })}
        }
        `);
    }

    src.push(`
        if (ok) {`);
  }

  for (const [name, value] of Object.entries(properties)) {
    const inner = builder.build(value as Rule<unknown>, name);
    if (inner) {
      src.push(`
  { /* ${name} */`);
      if (name !== 'value') {
        src.push(`
    const value = ${name};`);
      }

      src.push(`${inner}
  } /* ${name} */`);
    }
  }

  if (required) {
    src.push(`
        } /* if ok */`);
  }

  src.push(`
      }
    }`);

  return src.join('');
}

export const objectRuleBuilder: RuleBuilder = {
  types: ['object'],
  build: buildRuleObject,
};
