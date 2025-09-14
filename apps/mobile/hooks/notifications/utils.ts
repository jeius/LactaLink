import { Notification } from '@lactalink/types/payload-generated-types';
import { PaginatedDocs } from '@lactalink/types/payload-types';
import { InfiniteData } from '@tanstack/react-query';

export type ListData = InfiniteData<PaginatedDocs<Notification>>;

export const depth = 3;
