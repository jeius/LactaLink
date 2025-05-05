import { Address } from '@/lib/types';
import { extractID } from '@lactalink/utilities';
import { sanitizeStreetAddress } from '@lactalink/utilities/formatters';
import { CollectionBeforeChangeHook } from 'payload';

export const generateCompleteName: CollectionBeforeChangeHook<Address> = async (args) => {
  const { req, data } = args;
  const { payload } = req;

  const unsanitizedStreet = data.street;
  const barangayID = extractID(data.barangay);
  const cityID = extractID(data.cityMunicipality);
  const provinceID = extractID(data.province);
  const regionID = extractID(data.region);

  async function getBarangay() {
    if (typeof barangayID === 'string') {
      return (await payload.findByID({ collection: 'barangays', id: barangayID })).name;
    }
    return barangayID;
  }

  async function getCity() {
    if (typeof cityID === 'string') {
      return (await payload.findByID({ collection: 'citiesMunicipalities', id: cityID })).name;
    }
    return cityID;
  }

  async function getProvince() {
    if (typeof provinceID === 'string') {
      return (await payload.findByID({ collection: 'provinces', id: provinceID })).name;
    }
    return provinceID;
  }

  async function getRegion() {
    if (typeof regionID === 'string') {
      return (await payload.findByID({ collection: 'regions', id: regionID })).name;
    }
    return regionID;
  }

  const addressSections = await Promise.all([getBarangay(), getCity(), getProvince(), getRegion()]);

  const street = unsanitizedStreet && sanitizeStreetAddress(unsanitizedStreet);

  const address = [street, ...addressSections].filter(Boolean).join(', ');

  data.completeName = address;

  return data;
};
