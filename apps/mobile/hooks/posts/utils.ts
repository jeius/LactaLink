import { Where } from '@lactalink/types/payload-types';

export interface Config {
  enabled?: boolean;
  where?: Where;
  limit?: number;
  sort?: string;
  depth?: number;
}
