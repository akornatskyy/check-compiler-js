import {type Builder} from './builder';
import {type Rule, type Violation} from './types';

export type Check<T> = (input: T, violations: Violation[]) => void;

export class Compiler {
  constructor(private readonly builder: Builder) {}

  compile<T>(rule: Rule<T>, location?: string): Check<T> {
    const src = this.builder.build(rule, location);
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    return new Function('value', 'errors', src) as Check<T>;
  }
}
