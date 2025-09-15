import { PSGC_API_URL } from '@/lib/constants';
import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import {
  BarangayPSGC,
  CityMunicipalityPSGC,
  CollectionSlugPSGC,
  ExistingDocs,
  IslandGroupPSGC,
  ProvincePSGC,
  RawAndExistingDocs,
  RawPSGCDataMap,
  RegionPSGC,
  SlugPSGC,
} from '@lactalink/types/psgc';
import { formatCamelCaseCaps, formatKebabToTitle } from '@lactalink/utilities/formatters';
import { APIError, Payload } from 'payload';

const init: RequestInit = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
};

async function fetchPSGCFromExternal<T = unknown>(collection: SlugPSGC): Promise<T> {
  const url = `${PSGC_API_URL}/api/${collection}.json`;
  const res = await fetch(url, init);

  if (!res.ok) {
    throw new APIError(`Unable to fetch ${formatKebabToTitle(collection)} from PSGC.`, res.status);
  }

  const data: T = await res.json();
  return data;
}

type FilterParams<T extends CollectionSlugPSGC> = {
  data: RawPSGCDataMap[T][]; // Array of items with optional code
  collection: CollectionSlugPSGC;
  payload: Payload;
};

async function filterData<T extends CollectionSlugPSGC>({
  collection,
  data,
  payload,
}: FilterParams<T>): Promise<RawAndExistingDocs<T>> {
  payload.logger.info('>');

  const { docs, totalDocs } = await payload.find({
    collection,
    pagination: false,
    select: { code: true },
  });

  const existingDocs: ExistingDocs<T> = new Map();
  for (const doc of docs) {
    existingDocs.set(doc.code, doc.id);
  }

  const title = formatCamelCaseCaps(collection);
  payload.logger.info(`> Filtering raw ${title} data from PSGC...`);
  payload.logger.info(`> Found ${totalDocs} existing docs in the system's ${title}.`);

  const filteredData = data.filter(({ code }) => Boolean(!existingDocs.get(code)));
  payload.logger.info(`> ${title} to create: ${filteredData.length}`);
  payload.logger.info('>');

  return { rawData: filteredData, existingDocs };
}

export const seedPSGCHandler = createPayloadHandler({
  requireAdmin: true,
  successMessage: 'Fetch complete!',
  handler: async ({ payload }) => {
    payload.logger.info('>>> Starting seed of PSGC data...');

    // Fetch all data in parallel
    payload.logger.info('> Fetching all PSGC data in parallel...');
    const [islandGroups, regions, provinces, citiesMunicipalities, barangays] = await Promise.all([
      fetchPSGCFromExternal<IslandGroupPSGC[]>('island-groups'),
      fetchPSGCFromExternal<RegionPSGC[]>('regions'),
      fetchPSGCFromExternal<ProvincePSGC[]>('provinces'),
      fetchPSGCFromExternal<CityMunicipalityPSGC[]>('cities-municipalities'),
      fetchPSGCFromExternal<BarangayPSGC[]>('barangays'),
    ]);

    payload.logger.info('> All PSGC data fetched successfully');

    // Filter data in parallel as well
    payload.logger.info('> Filtering PSGC data by excluding existing data in the database...');
    const [
      filteredIslandGroups,
      filteredRegions,
      filteredProvinces,
      filteredCitiesMunicipalities,
      filteredBarangays,
    ] = await Promise.all([
      filterData({ collection: 'islandGroups', data: islandGroups, payload }),
      filterData({ collection: 'regions', data: regions, payload }),
      filterData({ collection: 'provinces', data: provinces, payload }),
      filterData({ collection: 'citiesMunicipalities', data: citiesMunicipalities, payload }),
      filterData({ collection: 'barangays', data: barangays, payload }),
    ]);

    const data = {
      islandGroups: filteredIslandGroups,
      regions: filteredRegions,
      provinces: filteredProvinces,
      citiesMunicipalities: filteredCitiesMunicipalities,
      barangays: filteredBarangays,
    };

    return data;
  },
});
