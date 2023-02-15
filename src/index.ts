import {DefaultBuilder} from './builder';
import {Check, Compiler} from './compiler';
import {arrayRuleBuilder} from './rules/array';
import {numberRuleBuilder} from './rules/number';
import {objectRuleBuilder} from './rules/object';
import {stringRuleBuilder} from './rules/string';
import {Rule} from './types';

export {Check} from './compiler';
export {Rule, Violation} from './types';

const COMPILER = new Compiler(
  new DefaultBuilder([
    numberRuleBuilder,
    stringRuleBuilder,
    objectRuleBuilder,
    arrayRuleBuilder,
  ]),
);

export function compile<T>(rule: Rule<T>, location?: string): Check<T> {
  return COMPILER.compile(rule, location);
}
