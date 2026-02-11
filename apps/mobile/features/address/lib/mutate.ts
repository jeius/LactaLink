import { getApiClient } from '@lactalink/api';
import { AddressCreateSchema, AddressSchema } from '@lactalink/form-schemas/address';
import { Address } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { filterUndefined } from '@lactalink/utilities/filters';
import { latLngToPoint } from '@lactalink/utilities/geo-utils';

const DEFAULT_DEPTH = 3;

export async function createAddress(data: AddressCreateSchema) {
  const apiClient = getApiClient();
  const { coordinates, geocodedAt, ...rest } = data;

  const newAddress = await apiClient.create({
    collection: 'addresses',
    depth: DEFAULT_DEPTH,
    data: {
      ...rest,
      geocodedAt: geocodedAt?.toISOString(),
      coordinates: latLngToPoint(coordinates),
      //@ts-expect-error This is auto-populated by the server, but is required by the type.
      owner: undefined, // Safe to set undefined since the server will populate this based on the authenticated user
    },
  });

  const updatedUser = await apiClient.auth.getMeUser();

  return { address: newAddress, user: updatedUser };
}

export async function updateAddress(data: Partial<Omit<AddressSchema, 'id'>> & { id: string }) {
  const apiClient = getApiClient();
  const { coordinates, geocodedAt, id, ...rest } = data;

  const point = coordinates && latLngToPoint(coordinates);

  const updateData = filterUndefined({
    ...rest,
    geocodedAt: geocodedAt === null ? null : geocodedAt?.toISOString(),
    coordinates: point,
  });

  const updatedAddress = await apiClient.updateByID({
    collection: 'addresses',
    id: id,
    depth: DEFAULT_DEPTH,
    data: updateData,
  });

  const updatedUser = await apiClient.auth.getMeUser();

  return { address: updatedAddress, user: updatedUser };
}

export async function deleteAddress(address: string | Address) {
  const apiClient = getApiClient();
  const deletedAddress = await apiClient.deleteByID({
    collection: 'addresses',
    id: extractID(address),
  });
  const updatedUser = await apiClient.auth.getMeUser();
  return { address: deletedAddress, user: updatedUser };
}
