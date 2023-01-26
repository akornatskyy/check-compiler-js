import {Builder} from './builder';
import {Rule, Violation} from './types';

export type Check<T> = (input: T, violations: Violation[]) => void;

export class Compiler {
  constructor(private readonly builder: Builder) {}

  compile<T>(rule: Rule<T>, location?: string): Check<T> {
    const src = this.builder.build(rule, location);
    return new Function('value', 'errors', src) as Check<T>;
  }
}
