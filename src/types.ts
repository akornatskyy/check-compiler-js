export type RuleBoolean = {
  type: 'boolean';
  messages?: RuleBooleanMessages;
};

export type RuleBooleanMessages = {
  ['field not null']?: string;
  ['boolean null']?: string;
  ['boolean']?: string;
};

export type RuleNumber = {
  type: 'number' | 'integer';
  min?: number;
  max?: number;
  messages?: RuleNumberMessages;
};

export type RuleNumberMessages = {
  ['field not null']?: string;
  ['number null']?: string;
  ['number']?: string;
  ['integer']?: string;
  ['number positive']?: string;
  ['number min']?: string;
  ['number range']?: string;
  ['number max']?: string;
};

export type RuleString = {
  type: 'string';
  min?: number;
  max?: number;
  pattern?: RegExp;
  messages?: RuleStringMessages;
};

export type RuleStringMessages = {
  ['field not null']?: string;
  ['string null']?: string;
  ['string']?: string;
  ['string blank']?: string;
  ['string min']?: string;
  ['string exact']?: string;
  ['string range']?: string;
  ['string max']?: string;
  ['string pattern']?: string;
};

export type RuleArray<T> = {
  type: 'array';
  items: Rule<T>;
  min?: number;
  max?: number;
  messages?: RuleArrayMessages;
};

export type RuleArrayMessages = {
  ['field not null']?: string;
  ['array null']?: string;
  ['array']?: string;
  ['array empty']?: string;
  ['array min']?: string;
  ['array exact']?: string;
  ['array range']?: string;
  ['array max']?: string;
};

export type Properties<T> = {
  [K in keyof T as string extends K ? never : K]-?: Rule<T[K]>;
};

export type RequiredProperties<T> = keyof {
  [K in keyof T as string extends K
    ? never
    : undefined extends T[K]
    ? never
    : K]: K;
};

export type Schema<T> = {
  type: 'object';
  messages?: SchemaMessages;
} & (keyof Properties<T> extends never
  ? {properties?: undefined}
  : {properties: Properties<T>}) &
  (RequiredProperties<T> extends never
    ? {required?: undefined}
    : {required: Readonly<RequiredProperties<T>[]>}) & {
    patternProperties?: {
      [pattern: string]:
        | RuleBoolean
        | RuleNumber
        | RuleString
        | {type: 'array' | 'object'};
    };
    minProperties?: number;
    maxProperties?: number;
    additionalProperties?: false;
  };

export type SchemaMessages = {
  ['object not null']?: string;
  ['object null']?: string;
  ['object']?: string;
  ['required']?: string;
  ['pattern object min properties']?: string;
  ['pattern object max properties']?: string;
  ['object no additional properties']?: string;
};

export type Nullable<T> = null extends T
  ? {nullable: true}
  : {nullable?: false};

export type Rule<T> = (T extends boolean
  ? RuleBoolean
  : T extends number
  ? RuleNumber
  : T extends string
  ? RuleString
  : T extends readonly unknown[]
  ? RuleArray<T[0]>
  : T extends object
  ? Schema<T>
  : never) &
  Nullable<T>;

export type Violation = {
  reason: string;
  message: string;
  location?: string;
  args?: {[key: string]: unknown};
};
