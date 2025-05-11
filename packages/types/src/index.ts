import { Config } from './payload-types';

export type * from './api';
export type * from './auth';
export type * from './errors';
export * from './forms';
export type * from './payload-types';
export type * from './preferences';
export type * from './psgc';

export type Theme = 'light' | 'dark';

export type Collections = Config['collections'][keyof Config['collections']];
