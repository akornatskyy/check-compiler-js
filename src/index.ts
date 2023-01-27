import {DefaultBuilder} from './builder';
import {Check, Compiler} from './compiler';
import {Rule} from './types';

export {Rule, Violation} from './types';

const COMPILER = new Compiler(new DefaultBuilder([]));

export function compile<T>(rule: Rule<T>): Check<T> {
  return COMPILER.compile(rule);
}
