import { APIResponse } from './api';

export type SlugPSGC =
  | 'island-groups'
  | 'regions'
  | 'provinces'
  | 'cities-municipalities'
  | 'barangays';

export type CollectionSlugPSGC =
  | 'islandGroups'
  | 'regions'
  | 'provinces'
  | 'citiesMunicipalities'
  | 'barangays';

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

export type ExistingDocs = Record<string, string>;

export type RawAndExistingDocs<T> = {
  rawData: T[];
  existingDocs: ExistingDocs;
};

export type IncomingIslandGroupData = {
  islandGroups: RawAndExistingDocs<IslandGroupPSGC>;
};

export type IncomingRegionData = {
  existingIslandGroups: ExistingDocs;
  regions: RawAndExistingDocs<RegionPSGC>;
};

export type IncomingProvinceData = {
  existingIslandGroups: ExistingDocs;
  existingRegions: ExistingDocs;
  provinces: RawAndExistingDocs<ProvincePSGC>;
};

export type IncomingCityMunicipalityData = {
  existingIslandGroups: ExistingDocs;
  existingRegions: ExistingDocs;
  existingProvinces: ExistingDocs;
  citiesMunicipalities: RawAndExistingDocs<CityMunicipalityPSGC>;
};

export type IncomingBarangayData = {
  existingIslandGroups: ExistingDocs;
  existingRegions: ExistingDocs;
  existingProvinces: ExistingDocs;
  existingCitiesMunicipalities: ExistingDocs;
  barangays: RawAndExistingDocs<BarangayPSGC>;
};

export type ResponseData = {
  islandGroups: RawAndExistingDocs<IslandGroupPSGC>;
  provinces: RawAndExistingDocs<ProvincePSGC>;
  regions: RawAndExistingDocs<RegionPSGC>;
  citiesMunicipalities: RawAndExistingDocs<CityMunicipalityPSGC>;
  barangays: RawAndExistingDocs<BarangayPSGC>;
};

export type PSGCResponse = APIResponse<ResponseData>;
