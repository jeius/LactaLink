import { Transaction } from '@lactalink/types/payload-generated-types';
import { PaginatedDocs, Where } from '@lactalink/types/payload-types';
import { InfiniteData } from '@tanstack/react-query';

export type ListData = InfiniteData<PaginatedDocs<Transaction>>;

export interface Overrides {
  where?: Where;
}

export const depth = 3;
