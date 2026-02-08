import { getApiClient } from '@lactalink/api';
import { Where } from '@lactalink/types/payload-types';

type PaginatedOptions = {
  page?: number;
  limit?: number;
  depth?: number;
};

type SingleDocOptions = {
  depth?: number;
};

const PAGINATED_OPTIONS: PaginatedOptions = { page: 1, limit: 15, depth: 1 };

//#region Paginated Docs
export function findAddressesByUser(userID: string, options: PaginatedOptions = {}) {
  return getApiClient().find({
    ...PAGINATED_OPTIONS,
    ...options,
    collection: 'addresses',
    pagination: true,
    joins: { deliveryPreferences: false },
    where: { owner: { equals: userID } },
  });
}

export function findProvinces(search: string, options: PaginatedOptions = {}) {
  return getApiClient().find({
    ...PAGINATED_OPTIONS,
    ...options,
    collection: 'provinces',
    pagination: true,
    sort: 'name',
    where: { name: { contains: search.trim().toLowerCase() } },
  });
}

export function findCities(search: string, provinceID?: string, options: PaginatedOptions = {}) {
  const filters: Where[] = [{ name: { contains: search.trim().toLowerCase() } }];

  if (provinceID) {
    filters.push({ province: { equals: provinceID } });
  }

  return getApiClient().find({
    ...PAGINATED_OPTIONS,
    ...options,
    collection: 'citiesMunicipalities',
    pagination: true,
    sort: 'name',
    where: { and: filters },
  });
}

export function findBarangays(search: string, cityID?: string, options: PaginatedOptions = {}) {
  const filters: Where[] = [{ name: { contains: search.trim().toLowerCase() } }];

  if (cityID) {
    filters.push({ cityMunicipality: { equals: cityID } });
  }

  return getApiClient().find({
    ...PAGINATED_OPTIONS,
    ...options,
    collection: 'barangays',
    pagination: true,
    sort: 'name',
    where: { and: filters },
  });
}
//#endregion

//#region Single Docs
export function findAddressByID(addressID: string, options: SingleDocOptions = {}) {
  return getApiClient().findByID({
    collection: 'addresses',
    id: addressID,
    depth: options.depth ?? 3,
    joins: { deliveryPreferences: false },
  });
}

export function findProvinceByID(provinceID: string, options: SingleDocOptions = {}) {
  return getApiClient().findByID({
    collection: 'provinces',
    id: provinceID,
    depth: options.depth ?? 1,
  });
}

export function findCityByID(cityID: string, options: SingleDocOptions = {}) {
  return getApiClient().findByID({
    collection: 'citiesMunicipalities',
    id: cityID,
    depth: options.depth ?? 1,
  });
}

export function findBarangayByID(barangayID: string, options: SingleDocOptions = {}) {
  return getApiClient().findByID({
    collection: 'barangays',
    id: barangayID,
    depth: options.depth ?? 1,
  });
}
//#endregion
