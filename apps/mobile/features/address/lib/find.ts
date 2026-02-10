import { getApiClient } from '@lactalink/api';
import { FindMany } from '@lactalink/types/api';
import { CollectionSlug, SelectFromCollectionSlug, Where } from '@lactalink/types/payload-types';

type PaginatedOptions<T extends boolean = true> = Pick<
  FindMany<CollectionSlug, SelectFromCollectionSlug<CollectionSlug>, T>,
  'page' | 'limit' | 'depth' | 'pagination'
>;

type SingleDocOptions = Pick<FindMany, 'depth'>;

const PAGINATED_OPTIONS: PaginatedOptions = { page: 1, limit: 15, depth: 1, pagination: true };

//#region Paginated Docs
export function findAddressesByUser(userID: string, options: PaginatedOptions = {}) {
  return getApiClient().find({
    ...PAGINATED_OPTIONS,
    ...options,
    collection: 'addresses',
    joins: { deliveryPreferences: false },
    where: { owner: { equals: userID } },
  });
}

export function findProvinces<T extends boolean = true>(
  search: string,
  options: PaginatedOptions<T> = {}
) {
  type Slug = 'provinces';
  return getApiClient().find<Slug, SelectFromCollectionSlug<Slug>, T>({
    ...(PAGINATED_OPTIONS as PaginatedOptions<T>),
    ...options,
    collection: 'provinces',
    sort: 'name',
    where: { name: { contains: search.trim().toLowerCase() } },
  });
}

export function findCities<T extends boolean = true>(
  search: string,
  provinceID?: string,
  options: PaginatedOptions<T> = {}
) {
  const filters: Where[] = [{ name: { contains: search.trim().toLowerCase() } }];

  if (provinceID) {
    filters.push({ province: { equals: provinceID } });
  }

  type Slug = 'citiesMunicipalities';
  return getApiClient().find<Slug, SelectFromCollectionSlug<Slug>, T>({
    ...(PAGINATED_OPTIONS as PaginatedOptions<T>),
    ...options,
    collection: 'citiesMunicipalities',
    sort: 'name',
    where: { and: filters },
  });
}

export function findBarangays<T extends boolean = true>(
  search: string,
  cityID?: string,
  options: PaginatedOptions<T> = {}
) {
  const filters: Where[] = [{ name: { contains: search.trim().toLowerCase() } }];

  if (cityID) {
    filters.push({ cityMunicipality: { equals: cityID } });
  }

  type Slug = 'barangays';
  return getApiClient().find<Slug, SelectFromCollectionSlug<Slug>, T>({
    ...(PAGINATED_OPTIONS as PaginatedOptions<T>),
    ...options,
    collection: 'barangays',
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
