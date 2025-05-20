import { Address, AddressSchema, ApiOptions } from '@lactalink/types';
import { createDoc } from '@lactalink/utilities';

export async function createAddresses(
  addresses: AddressSchema[],
  options: Omit<ApiOptions<Address, 'CREATE'>, 'collection' | 'data'>
): Promise<Address[]> {
  const results = await Promise.allSettled(
    addresses.map((data) =>
      createDoc<Address>({
        ...options,
        collection: 'addresses',
        data,
      })
    )
  );

  const fulfilled = results.filter(
    (r): r is PromiseFulfilledResult<Address> => r.status === 'fulfilled'
  );

  if (fulfilled.length !== addresses.length) {
    throw new Error('Some addresses failed to create.');
  }

  return fulfilled.map((r) => r.value);
}
