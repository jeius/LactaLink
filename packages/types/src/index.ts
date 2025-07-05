import { DELIVERY_OPTIONS } from '@lactalink/enums';

export type * from './api';
export type * from './auth';
export * from './collections';
export type * from './errors';
export * from './forms';
export * from './geo-types';
export type * from './interfaces';
export type * from './payload-types';
export type * from './preferences';
export type * from './psgc';
export * from './utils';

export type Theme = 'light' | 'dark';
export type DeliveryMode = (typeof DELIVERY_OPTIONS)[keyof typeof DELIVERY_OPTIONS]['value'];
