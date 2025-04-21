export type SlugPSGC =
  | 'island-groups'
  | 'regions'
  | 'provinces'
  | 'cities-municipalities'
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
