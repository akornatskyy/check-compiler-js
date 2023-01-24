export type RuleNumber = {
  type: 'number' | 'integer';
  min?: number;
  max?: number;
};

export type RuleString = {
  type: 'string';
  min?: number;
  max?: number;
  pattern?: RegExp;
};

export type RuleArray<T> = {
  type: 'array';
  items: Rule<T>;
  min?: number;
  max?: number;
};

export type Properties<T> = {
  [K in keyof T]-?: Rule<T[K]>;
};

export type RequiredProperties<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

export type Schema<T> = {
  type: 'object';
  properties: Properties<T>;
} & ([RequiredProperties<T>] extends [never]
  ? {required?: undefined}
  : {required: Readonly<RequiredProperties<T>[]>});

export type Nullable<T> = null extends T
  ? {nullable: true}
  : {nullable?: false};

export type Rule<T> = (T extends number
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
};
