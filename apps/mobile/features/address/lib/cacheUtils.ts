import { QUERY_KEYS } from '@/lib/constants/queryKeys';
import {
  Address,
  Barangay,
  CityMunicipality,
  Province,
  User,
} from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { QueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import {
  createAddressesInfQuery,
  createAddressQuery,
  createBarangayQuery,
  createCityQuery,
  createProvinceQuery,
} from './queryOptions';

export function addAddressToCache(client: QueryClient, address: Address) {
  const queryKey = createAddressQuery(address).queryKey;
  client.setQueryData(queryKey, address);
}

export function addProvinceToCache(client: QueryClient, province: Province) {
  const queryKey = createProvinceQuery(province).queryKey;
  client.setQueryData(queryKey, province);
}

export function addCityToCache(client: QueryClient, city: CityMunicipality) {
  const queryKey = createCityQuery(city).queryKey;
  client.setQueryData(queryKey, city);
}

export function addBarangayToCache(client: QueryClient, barangay: Barangay) {
  const queryKey = createBarangayQuery(barangay).queryKey;
  client.setQueryData(queryKey, barangay);
}

export function addAddressToInfiniteCache(
  client: QueryClient,
  address: Address,
  user: string | User
) {
  const queryKey = createAddressesInfQuery(user).queryKey;

  client.setQueryData(queryKey, (oldData) => {
    if (!oldData) return oldData;

    return produce(oldData, (draft) => {
      const addressID = extractID(address);
      for (const page of draft.pages) {
        // Check if the address already exists in the page
        if (page.docs.has(addressID)) {
          // If it exists, just update the existing entry
          page.docs.set(addressID, address);
          return; // Exit after updating to avoid adding duplicate entries
        }
      }
      // If the address was not found in any page, add it to the first page
      const firstPage = draft.pages[0];
      if (firstPage) {
        // Convert the Map to an array
        const arrayData = Array.from(firstPage.docs.values());
        // Add at the beginning to ensure it appears first in the list
        arrayData.unshift(address);
        // Convert back to Map and update the page
        firstPage.docs = new Map(arrayData.map((addr) => [extractID(addr), addr]));
      }
    });
  });
}

export function addAddressToAllCaches(client: QueryClient, address: Address, user: string | User) {
  addAddressToCache(client, address);
  addAddressToInfiniteCache(client, address, user);
}

export function removeAddressFromCache(client: QueryClient, address: string | Address) {
  const queryKey = createAddressQuery(address).queryKey;
  client.removeQueries({ queryKey, exact: true });
}

export function removeAddressFromInfiniteCache(
  client: QueryClient,
  address: string | Address,
  user: string | User
) {
  const queryKey = createAddressesInfQuery(user).queryKey;

  client.setQueryData(queryKey, (oldData) => {
    if (!oldData) return oldData;
    return produce(oldData, (draft) => {
      const addressID = extractID(address);

      for (const page of draft.pages) {
        if (!page.docs.has(addressID)) continue;
        page.docs = new Map(page.docs);
        page.docs.delete(addressID);
      }
    });
  });
}

export function removeAddressFromAllCaches(
  client: QueryClient,
  address: string | Address,
  user: string | User
) {
  removeAddressFromCache(client, address);
  removeAddressFromInfiniteCache(client, address, user);
}

export async function invalidateAddressFromAllCaches(
  client: QueryClient,
  address: string | Address
) {
  const queryKey = createAddressQuery(address).queryKey;
  const infQueryKey = QUERY_KEYS.ADDRESSES.INFINITE;
  await Promise.all([
    client.invalidateQueries({ queryKey, exact: true }),
    client.invalidateQueries({ queryKey: infQueryKey }),
  ]);
}
