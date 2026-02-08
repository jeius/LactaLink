import {
  Address,
  Barangay,
  CityMunicipality,
  Province,
  User,
} from '@lactalink/types/payload-generated-types';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  addAddressToCache,
  addBarangayToCache,
  addCityToCache,
  addProvinceToCache,
} from '../lib/cacheUtils';
import {
  createAddressesInfQuery,
  createAddressQuery,
  createBarangayQuery,
  createBarangaysInfQuery,
  createCitiesInfQuery,
  createCityQuery,
  createProvinceQuery,
  createProvincesInfQuery,
} from '../lib/queryOptions';

//#region Single Docs Queries
export function useAddress(address: string | Address | null | undefined) {
  return useQuery(createAddressQuery(address));
}

export function useProvince(province: string | Province | null | undefined) {
  return useQuery(createProvinceQuery(province));
}

export function useCityMunicipality(city: string | CityMunicipality | null | undefined) {
  return useQuery(createCityQuery(city));
}

export function useBarangay(barangay: string | Barangay | null | undefined) {
  return useQuery(createBarangayQuery(barangay));
}
// #endregion

//#region Infinite Queries
export function useInfiniteAddresses(user: string | User | null | undefined) {
  const queryClient = useQueryClient();
  const { data, ...query } = useInfiniteQuery(createAddressesInfQuery(user));

  const { dataArray, dataMap } = useMemo(() => {
    const dataMap: Map<string, Address> = new Map();

    if (!data) return { dataArray: Array.from(dataMap.values()), dataMap };

    for (const page of data.pages) {
      for (const doc of page.docs.values()) {
        // Add to cache if it's not placeholder data
        if (!query.isPlaceholderData) addAddressToCache(queryClient, doc);
        // Add to map
        dataMap.set(doc.id, doc);
      }
    }

    return { dataArray: Array.from(dataMap.values()), dataMap };
  }, [data, query.isPlaceholderData, queryClient]);

  return { data: dataArray, dataMap, ...query };
}

export function useInfiniteProvinces(search: string) {
  const queryClient = useQueryClient();
  const { data, ...query } = useInfiniteQuery(createProvincesInfQuery(search));

  const { dataArray, dataMap } = useMemo(() => {
    const dataMap: Map<string, Province> = new Map();

    if (!data) return { dataArray: Array.from(dataMap.values()), dataMap };

    for (const page of data.pages) {
      for (const doc of page.docs.values()) {
        // Add to cache if it's not placeholder data
        if (!query.isPlaceholderData) addProvinceToCache(queryClient, doc);
        // Add to map
        dataMap.set(doc.id, doc);
      }
    }

    return { dataArray: Array.from(dataMap.values()), dataMap };
  }, [data, query.isPlaceholderData, queryClient]);

  return { data: dataArray, dataMap, ...query };
}

export function useInfiniteCities(search: string, provinceID?: string) {
  const queryClient = useQueryClient();
  const { data, ...query } = useInfiniteQuery(createCitiesInfQuery(search, provinceID));

  const { dataArray, dataMap } = useMemo(() => {
    const dataMap: Map<string, CityMunicipality> = new Map();

    if (!data) return { dataArray: Array.from(dataMap.values()), dataMap };

    for (const page of data.pages) {
      for (const doc of page.docs.values()) {
        // Add to cache if it's not placeholder data
        if (!query.isPlaceholderData) addCityToCache(queryClient, doc);
        // Add to map
        dataMap.set(doc.id, doc);
      }
    }

    return { dataArray: Array.from(dataMap.values()), dataMap };
  }, [data, query.isPlaceholderData, queryClient]);

  return { data: dataArray, dataMap, ...query };
}

export function useInfiniteBarangays(search: string, cityID?: string) {
  const queryClient = useQueryClient();
  const { data, ...query } = useInfiniteQuery(createBarangaysInfQuery(search, cityID));

  const { dataArray, dataMap } = useMemo(() => {
    const dataMap: Map<string, Barangay> = new Map();

    if (!data) return { dataArray: Array.from(dataMap.values()), dataMap };

    for (const page of data.pages) {
      for (const doc of page.docs.values()) {
        // Add to cache if it's not placeholder data
        if (!query.isPlaceholderData) addBarangayToCache(queryClient, doc);
        // Add to map
        dataMap.set(doc.id, doc);
      }
    }

    return { dataArray: Array.from(dataMap.values()), dataMap };
  }, [data, query.isPlaceholderData, queryClient]);

  return { data: dataArray, dataMap, ...query };
}
//#endregion

export function usePrefetchAddress(user: string | User | null | undefined) {
  useInfiniteAddresses(user);
}
