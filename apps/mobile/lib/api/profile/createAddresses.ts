import { getApiClient } from '@lactalink/api';
import { Address, AddressSchema } from '@lactalink/types';
export async function createAddresses(addresses: AddressSchema[]): Promise<Address[]> {
  const client = getApiClient();

  const results = await Promise.allSettled(
    addresses.map((data) => {
      const { coordinates: { latitude, longitude } = {}, ...rest } = data;

      const coordinates: [number, number] | undefined =
        latitude && longitude ? [longitude, latitude] : undefined;

      return client.create({
        collection: 'addresses',
        data: { ...rest, coordinates },
        select: { id: true },
        depth: 0,
      });
    })
  );

  const fulfilled = results.filter(
    (r): r is PromiseFulfilledResult<Address> => r.status === 'fulfilled'
  );

  if (fulfilled.length !== addresses.length) {
    throw new Error('Some addresses failed to create.');
  }

  return fulfilled.map((r) => r.value);
}
