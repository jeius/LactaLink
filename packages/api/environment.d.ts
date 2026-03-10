import { Config } from '@lactalink/types/payload-generated-types';

declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}
