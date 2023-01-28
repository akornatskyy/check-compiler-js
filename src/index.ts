import {DefaultBuilder} from './builder';
import {Check, Compiler} from './compiler';
import {numberRuleBuilder} from './rules/number';
import {Rule} from './types';

export {Rule, Violation} from './types';

const COMPILER = new Compiler(new DefaultBuilder([numberRuleBuilder]));

export function compile<T>(rule: Rule<T>): Check<T> {
  return COMPILER.compile(rule);
}
