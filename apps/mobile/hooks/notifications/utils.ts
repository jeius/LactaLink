import { Notification, PaginatedDocs } from '@lactalink/types';
import { InfiniteData } from '@tanstack/react-query';

export type ListData = InfiniteData<PaginatedDocs<Notification>>;

export const depth = 3;
