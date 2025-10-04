export type * from './errors';
export type * from './geo-types';
export type * from './preferences';
export type * from './views';

export type Theme = 'light' | 'dark';
export type ImageData = {
  uri: string | null;
  alt: string;
  blurHash: string;
};
