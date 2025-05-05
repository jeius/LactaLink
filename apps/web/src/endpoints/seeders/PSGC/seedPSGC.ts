import { PSGC_API_URL } from '@/lib/constants';
import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import {
  BarangayPSGC,
  CityMunicipalityPSGC,
  CollectionSlugPSGC,
  IslandGroupPSGC,
  ProvincePSGC,
  RawAndExistingDocs,
  RegionPSGC,
  SlugPSGC,
} from '@lactalink/types';
import { formatCamelCaseCaps, formatKebabToTitle } from '@lactalink/utilities/formatters';
import { APIError, Payload } from 'payload';

const init: RequestInit = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
};

async function fetchJson<T = unknown>(collection: SlugPSGC): Promise<T> {
  const url = `${PSGC_API_URL}/api/${collection}.json`;
  const res = await fetch(url, init);

  if (!res.ok) {
    throw new APIError(`Unable to fetch ${formatKebabToTitle(collection)} from PSGC.`, res.status);
  }

  const data: T = await res.json();
  return data;
}

type FilterParams<T extends { code: string }> = {
  data: T[]; // Array of items with optional code
  collection: CollectionSlugPSGC;
  payload: Payload;
};

async function filterData<T extends { code: string }>({
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

  const existingDocs: Record<string, string> = {}; //code:id pairs
  for (const doc of docs) {
    existingDocs[doc.code] = doc.id;
  }

  const title = formatCamelCaseCaps(collection);
  payload.logger.info(`> Filtering raw ${title} data from PSGC...`);
  payload.logger.info(`> Found ${totalDocs} existing docs in the system's ${title}.`);

  const filteredData = data.filter(({ code }) => Boolean(!existingDocs[code]));
  payload.logger.info(`> ${title} to create: ${filteredData.length}`);
  payload.logger.info('>');

  return { rawData: filteredData, existingDocs };
}

export const seedPSGCHandler = createPayloadHandler({
  requireAdmin: true,
  successMessage: 'Fetch complete!',
  handler: async ({ payload }) => {
    payload.logger.info('>>> Starting seed of PSGC data...');

    payload.logger.info('> Fetching island groups from PSGC');
    const islandGroups = await fetchJson<IslandGroupPSGC[]>('island-groups');

    payload.logger.info('> Fetching regions from PSGC');
    const regions = await fetchJson<RegionPSGC[]>('regions');

    payload.logger.info('> Fetching provinces from PSGC');
    const provinces = await fetchJson<ProvincePSGC[]>('provinces');

    payload.logger.info('> Fetching cities/municipalities from PSGC');
    const citiesMunicipalities = await fetchJson<CityMunicipalityPSGC[]>('cities-municipalities');

    payload.logger.info('> Fetching barangays from PSGC');
    const barangays = await fetchJson<BarangayPSGC[]>('barangays');

    const data = {
      islandGroups: await filterData({ collection: 'islandGroups', data: islandGroups, payload }),
      regions: await filterData({ collection: 'regions', data: regions, payload }),
      provinces: await filterData({ collection: 'provinces', data: provinces, payload }),
      citiesMunicipalities: await filterData({
        collection: 'citiesMunicipalities',
        data: citiesMunicipalities,
        payload,
      }),
      barangays: await filterData({ collection: 'barangays', data: barangays, payload }),
    };

    return data;
  },
});
