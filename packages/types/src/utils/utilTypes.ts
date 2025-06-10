export type ExtractKeys<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

export type FilterUnion<T, U> = T extends U ? T : never;

export type NativeFile = {
  uri: string;
  name: string;
  type: string;
};
