import { PaginatedDocs, Transaction, Where } from '@lactalink/types';
import { InfiniteData } from '@tanstack/react-query';

export type ListData = InfiniteData<PaginatedDocs<Transaction>>;

export interface Overrides {
  where?: Where;
}

export const depth = 3;
