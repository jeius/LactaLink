export type ExtractKeys<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

export type FilterUnion<T, U> = T extends U ? T : never;

export type NativeFile = {
  uri: string;
  name: string;
  type: string;
};

export type NonNever<Type extends {}> = Pick<
  Type,
  {
    [Key in keyof Type]: Type[Key] extends never ? never : Key;
  }[keyof Type]
>;

export type MarkOptional<Type, Keys extends keyof Type> = Type extends Type
  ? Omit<Type, Keys> & Partial<Pick<Type, Keys>>
  : never;

/**
 * Utility type to make an optional key K in type T required.
 * Usage: MarkKeyRequired<T, 'keyName'>
 */
export type MarkKeyRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
