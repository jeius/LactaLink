import { getApiClient } from '@lactalink/api';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { SelectFromCollectionSlug, Where } from '@lactalink/types/payload-types';
import { DataMarkerSlug } from './types';

export async function fetchMarkers<TSlug extends DataMarkerSlug>(slug: TSlug) {
  const apiClient = getApiClient();
  let where: Where | undefined;

  if (slug === 'donations' || slug === 'requests') {
    where = { status: { equals: DONATION_REQUEST_STATUS.AVAILABLE.value } };
  }

  return apiClient.find<TSlug, SelectFromCollectionSlug<TSlug>, false>({
    collection: slug,
    where,
    depth: 5,
    pagination: false,
    populate: {
      addresses: { coordinates: true, displayName: true, isDefault: true, name: true, owner: true },
      users: { addresses: true },
    },
  });
}
