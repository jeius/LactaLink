import { Config as PayloadConfig } from '@lactalink/types/payload-generated-types';
export type GeneratedTypes = {};

type IsAugmented = keyof GeneratedTypes extends never ? false : true;

export type Config = IsAugmented extends true ? GeneratedTypes : PayloadConfig;
