import { Rule, Violation } from './types';

export interface RuleBuilder {
  types: string[];
  build<T>(builder: Builder, rule: Rule<T>, location?: string): string;
}

export interface Builder {
  readonly locations: string[];
  build<T>(rule: Rule<T>, location?: string): string;
  addViolation(v: Violation): string;
}

export class DefaultBuilder implements Builder {
  private readonly rules: Record<string, RuleBuilder | undefined> = {};

  readonly locations: string[] = [];

  constructor(rules: RuleBuilder[]) {
    for (const r of rules) {
      for (const t of r.types) {
        this.rules[t] = r;
      }
    }
  }

  build<T>(rule: Rule<T>, location?: string): string {
    const b = this.rules[rule.type];
    if (b === undefined) {
      return '';
    }

    if (location !== undefined) {
      this.locations.push(
        join(location, this.locations.at(-1)),
      );
    }

    const src = b.build(this, rule, location);
    if (location !== undefined) {
      this.locations.pop();
    }

    return src;
  }

  addViolation(violation: Violation): string {
    const {reason, message} = violation;
    let location = this.locations.at(-1);
    if (violation.location) {
      location = join(violation.location, location);
    }

    return `errors.push({${
      location
        ? `location: ${
            location.startsWith('`') ? location : JSON.stringify(location)
          }, `
        : ''
    }reason: "${reason}", message: ${JSON.stringify(message)}});`;
  }
}

function join(name: string, location: string | undefined) {
  if (!location) {
    return name;
  }

  if (name.startsWith('`')) {
    name = name.slice(1);
    if (!name.startsWith('[')) {
      name = '.' + name;
    }

    return location.endsWith('`')
      ? location.slice(0, Math.max(0, location.length - 1)) + name
      : '`' + location + name;
  }

  if (!name.startsWith('[')) {
    name = '.' + name;
  }

  if (location.endsWith('`')) {
    return location.slice(0, Math.max(0, location.length - 1)) + name + '`';
  }

  return location + name;
}
