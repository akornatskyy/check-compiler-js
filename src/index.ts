import {DefaultBuilder} from './builder';
import {Check, Compiler} from './compiler';
import {numberRuleBuilder} from './rules/number';
import {stringRuleBuilder} from './rules/string';
import {Rule} from './types';

export {Rule, Violation} from './types';

const COMPILER = new Compiler(
  new DefaultBuilder([numberRuleBuilder, stringRuleBuilder]),
);

export function compile<T>(rule: Rule<T>): Check<T> {
  return COMPILER.compile(rule);
}
