import { QUERY_KEYS } from '@/lib/constants';
import { generatePlaceHoldersForInfQueries } from '@/lib/utils/generatePlaceholdersForInfQueries';
import { transformToInfiniteDataMap } from '@/lib/utils/transformToInfiniteData';
import {
  Address,
  Barangay,
  CityMunicipality,
  Province,
  User,
} from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { transformToPaginatedMappedDocs } from '@lactalink/utilities/transformers';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import {
  findAddressByID,
  findAddressesByUser,
  findBarangayByID,
  findBarangays,
  findCities,
  findCityByID,
  findProvinceByID,
  findProvinces,
} from './find';

const ADDRESS_DEPTH = 3;

export function createAddressQuery(address: string | Address | null | undefined) {
  const addressID = extractID(address);
  return queryOptions({
    enabled: !!addressID,
    queryKey: [...QUERY_KEYS.ADDRESSES.ONE, addressID],
    queryFn: async () => {
      if (!addressID) throw new Error('Address ID is required to fetch the address.');
      return findAddressByID(addressID, { depth: ADDRESS_DEPTH });
    },
    placeholderData: extractCollection(address) || undefined,
  });
}

export function createAddressesInfQuery(user: string | User | null | undefined) {
  const userID = extractID(user);

  const addresses = extractCollection(user)?.addresses;
  const initialData = transformToInfiniteDataMap(addresses);
  const limit = addresses?.docs?.length ?? 10;

  return infiniteQueryOptions({
    enabled: !!userID,
    initialPageParam: 1,
    queryKey: [...QUERY_KEYS.ADDRESSES.INFINITE, userID],
    queryFn: async ({ pageParam }) => {
      if (!userID) throw new Error('User ID is required to fetch addresses.');

      const paginatedDocs = await findAddressesByUser(userID, {
        page: pageParam,
        limit,
        depth: ADDRESS_DEPTH,
      });

      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: initialData ?? generatePlaceHoldersForInfQueries<Address>(limit),
  });
}

export function createProvincesInfQuery(search: string) {
  return infiniteQueryOptions({
    initialPageParam: 1,
    queryKey: [...QUERY_KEYS.PSGC.INFINITE, 'provinces', search],
    queryFn: async ({ pageParam }) => {
      const paginatedDocs = await findProvinces(search, { page: pageParam });
      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: (prev) => prev ?? generatePlaceHoldersForInfQueries<Province>(15),
  });
}

export function createCitiesInfQuery(search: string, provinceID?: string) {
  return infiniteQueryOptions({
    initialPageParam: 1,
    queryKey: [...QUERY_KEYS.PSGC.INFINITE, 'cities', search, provinceID],
    queryFn: async ({ pageParam }) => {
      const paginatedDocs = await findCities(search, provinceID, { page: pageParam });
      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: (prev) => prev ?? generatePlaceHoldersForInfQueries<CityMunicipality>(15),
  });
}

export function createBarangaysInfQuery(search: string, cityID?: string) {
  return infiniteQueryOptions({
    initialPageParam: 1,
    queryKey: [...QUERY_KEYS.PSGC.INFINITE, 'barangays', search, cityID],
    queryFn: async ({ pageParam }) => {
      const paginatedDocs = await findBarangays(search, cityID, { page: pageParam });
      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: (prev) => prev ?? generatePlaceHoldersForInfQueries<Barangay>(15),
  });
}

export function createProvinceQuery(province: string | Province | null | undefined) {
  const provinceID = extractID(province);
  return queryOptions({
    enabled: !!provinceID,
    queryKey: [...QUERY_KEYS.PSGC.ONE, 'province', provinceID],
    queryFn: async () => {
      if (!provinceID) throw new Error('Province ID is required to fetch the province.');
      return findProvinceByID(provinceID, { depth: 1 });
    },
    placeholderData: extractCollection(province) || undefined,
  });
}

export function createCityQuery(city: string | CityMunicipality | null | undefined) {
  const cityID = extractID(city);
  return queryOptions({
    enabled: !!cityID,
    queryKey: [...QUERY_KEYS.PSGC.ONE, 'city', cityID],
    queryFn: async () => {
      if (!cityID)
        throw new Error('City/Municipality ID is required to fetch the city/municipality.');
      return findCityByID(cityID, { depth: 1 });
    },
    placeholderData: extractCollection(city) || undefined,
  });
}

export function createBarangayQuery(barangay: string | Barangay | null | undefined) {
  const barangayID = extractID(barangay);
  return queryOptions({
    enabled: !!barangayID,
    queryKey: [...QUERY_KEYS.PSGC.ONE, 'barangay', barangayID],
    queryFn: async () => {
      if (!barangayID) throw new Error('Barangay ID is required to fetch the barangay.');
      return findBarangayByID(barangayID, { depth: 1 });
    },
    placeholderData: extractCollection(barangay) || undefined,
  });
}
