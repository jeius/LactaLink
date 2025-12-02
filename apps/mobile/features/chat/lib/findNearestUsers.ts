import { getApiClient } from '@lactalink/api';
import { extractID } from '@lactalink/utilities/extractors';
import { latLngToPoint } from '@lactalink/utilities/geo-utils';
import { RNLatLng } from 'react-native-google-maps-plus';

export async function findNearestUsers(coordinates: RNLatLng | null) {
  const point = coordinates && latLngToPoint(coordinates);

  if (!point) return [];

  const apiClient = getApiClient();

  const nearestAddresses = await apiClient.find({
    collection: 'addresses',
    limit: 16,
    pagination: false,
    depth: 0,
    select: { owner: true },
    where: {
      and: [
        { coordinates: { near: [...point, 1000 * 20] } }, // 20 km
        { isDefault: { equals: true } },
        { owner: { exists: true } },
      ],
    },
  });

  const ownerIDs = nearestAddresses
    .map((addr) => extractID(addr.owner))
    .filter(Boolean) as string[];

  return apiClient.find({
    collection: 'users',
    where: { id: { in: ownerIDs } },
    depth: 5,
    select: { profile: true, email: true },
    pagination: false,
  });
}
