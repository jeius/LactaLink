import {
  Address,
  Barangay,
  CityMunicipality,
  Province,
  User,
} from '@lactalink/types/payload-generated-types';
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
      for (const page of draft.pages) {
        page.docs = new Map(page.docs).set(address.id, address);
      }
    });
  });
}
