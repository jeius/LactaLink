import { Config } from './src/payload-types/generated';

declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}
