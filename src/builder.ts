import {Rule, Violation} from './types';

export interface RuleBuilder {
  types: string[];
  build<T>(builder: Builder, rule: Rule<T>, location?: string): string;
}

export interface Builder {
  build<T>(rule: Rule<T>, location?: string): string;
  addViolation(v: Violation): string;
}

export class DefaultBuilder implements Builder {
  private readonly rules: Record<string, RuleBuilder | undefined> = {};

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

    const src = b.build(this, rule, location);
    return src;
  }

  addViolation(violation: Violation): string {
    const {reason, message} = violation;
    return `errors.push({reason: "${reason}", message: ${JSON.stringify(
      message,
    )}});`;
  }
}
