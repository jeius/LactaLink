import { Collection } from '@lactalink/types/collections';
import { QueryClient } from '@tanstack/react-query';
import { createDataMarkerQueryOptions } from '../queryOptions';
import { DataMarkerSlug } from '../types';

export function addToDataMarkerCache<TSlug extends DataMarkerSlug>(
  client: QueryClient,
  data: { value: Collection<TSlug>; relationTo: TSlug }
) {
  const queryKey = createDataMarkerQueryOptions({
    id: data.value.id,
    type: data.relationTo,
  }).queryKey;
  client.setQueryData(queryKey, data.value);
}
