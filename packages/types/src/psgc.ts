import type { ApiFetchResponse } from '@/api';
import type { Collection } from '@/collections';
import type { CollectionSlug } from '@/payload-types';

export type SlugPSGC =
  | 'island-groups'
  | 'regions'
  | 'provinces'
  | 'cities-municipalities'
  | 'barangays';

export type CollectionSlugPSGC = Extract<
  CollectionSlug,
  'islandGroups' | 'regions' | 'provinces' | 'citiesMunicipalities' | 'barangays'
>;

export type IslandGroupPSGC = {
  name: string;
  code: string;
};

export type RegionPSGC = {
  name: string;
  code: string;
  regionName: string;
  islandGroupCode: string;
};

export type ProvincePSGC = {
  name: string;
  code: string;
  regionCode: string;
  islandGroupCode: string;
};

export type DistrictPSGC = {
  name: string;
  code: string;
  regionCode: string;
  islandGroupCode: string;
};

export type SubMunicipalityPSGC = {
  name: string;
  oldName: string;
  code: string;
  districtCode: string;
  provinceCode: string;
  regionCode: string;
  islandGroupCode: string;
};

export type CityMunicipalityPSGC = {
  name: string;
  oldName: string;
  code: string;
  isCapital: boolean;
  isCity: boolean;
  isMunicipality: boolean;
  districtCode: string | boolean;
  provinceCode: string | boolean;
  regionCode: string;
  islandGroupCode: string;
};

export type BarangayPSGC = {
  name: string;
  oldName: string;
  code: string;
  cityCode: string | boolean;
  municipalityCode: string | boolean;
  subMunicipalityCode: string | boolean;
  districtCode: string | boolean;
  provinceCode: string;
  regionCode: string;
  islandGroupCode: string;
};

export type RawPSGCData =
  | IslandGroupPSGC
  | RegionPSGC
  | ProvincePSGC
  | CityMunicipalityPSGC
  | BarangayPSGC;

export type RawPSGCDataMap = {
  islandGroups: IslandGroupPSGC;
  regions: RegionPSGC;
  provinces: ProvincePSGC;
  citiesMunicipalities: CityMunicipalityPSGC;
  barangays: BarangayPSGC;
};

export type CollectionPSGC<T extends CollectionSlugPSGC | unknown = unknown> = T extends unknown
  ? Collection<CollectionSlugPSGC>
  : Collection<T>;

export type ExistingDocs<T extends CollectionSlugPSGC = CollectionSlugPSGC> = Map<
  RawPSGCDataMap[T]['code'],
  CollectionPSGC<T>['id']
>;

export type RawAndExistingDocs<T extends CollectionSlugPSGC = CollectionSlugPSGC> = {
  rawData: RawPSGCDataMap[T][];
  existingDocs: ExistingDocs<T>;
};

type RegionsExistingDocsData = {
  islandGroups: ExistingDocs<'islandGroups'>;
};

type ProvincesExistingDocsData = {
  islandGroups: ExistingDocs<'islandGroups'>;
  regions: ExistingDocs<'regions'>;
};
type CitiesMunicipalitiesExistingDocsData = {
  islandGroups: ExistingDocs<'islandGroups'>;
  regions: ExistingDocs<'regions'>;
  provinces: ExistingDocs<'provinces'>;
};
type BarangaysExistingDocsData = {
  islandGroups: ExistingDocs<'islandGroups'>;
  regions: ExistingDocs<'regions'>;
  provinces: ExistingDocs<'provinces'>;
  citiesMunicipalities: ExistingDocs<'citiesMunicipalities'>;
};

export type ExistingDocsData<T extends CollectionSlugPSGC> = T extends 'islandGroups'
  ? null
  : T extends 'regions'
    ? RegionsExistingDocsData
    : T extends 'provinces'
      ? ProvincesExistingDocsData
      : T extends 'citiesMunicipalities'
        ? CitiesMunicipalitiesExistingDocsData
        : T extends 'barangays'
          ? BarangaysExistingDocsData
          : never;

export type IncomingData<T extends CollectionSlugPSGC> = {
  data: RawAndExistingDocs<T>;
  existingData: ExistingDocsData<T>;
};

export type PSGCResponseData = {
  islandGroups: RawAndExistingDocs<'islandGroups'>;
  provinces: RawAndExistingDocs<'provinces'>;
  regions: RawAndExistingDocs<'regions'>;
  citiesMunicipalities: RawAndExistingDocs<'citiesMunicipalities'>;
  barangays: RawAndExistingDocs<'barangays'>;
};

export type PSGCResponse = ApiFetchResponse<PSGCResponseData>;
