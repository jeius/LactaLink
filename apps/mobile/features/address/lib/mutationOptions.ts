import { TOAST_ID } from '@/lib/constants';
import { AddressCreateSchema } from '@lactalink/form-schemas/address';
import { GooglePlacesResult } from '@lactalink/types/geocoding';
import { ValidationError } from '@lactalink/utilities/errors';
import { formatCityName } from '@lactalink/utilities/formatters';
import { parseGooglePlacesResult } from '@lactalink/utilities/geocoding';
import { mutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { addBarangayToCache, addCityToCache, addProvinceToCache } from './cacheUtils';
import { findBarangays, findCities, findProvinces } from './find';

export function createAddressAutofillMutation() {
  return mutationOptions({
    mutationFn: async (input: GooglePlacesResult, { client }) => {
      const { barangay, city, province, zipCode, coordinates, street } =
        parseGooglePlacesResult(input);

      const newValues: Partial<
        Pick<
          AddressCreateSchema,
          'barangay' | 'province' | 'cityMunicipality' | 'zipCode' | 'street'
        >
      > = {
        street: street ?? '',
        zipCode: zipCode ?? '',
        barangay: null,
        //@ts-expect-error: Must be null for initial state
        province: null,
        //@ts-expect-error: Must be null for initial state
        cityMunicipality: null,
      };

      const baseOptions = { limit: 1, pagination: false, depth: 3 } as const;

      if (province) {
        const provinces = await findProvinces(province, baseOptions);
        if (provinces.length > 0) {
          const province = provinces[0]!;
          newValues.province = province.id;
          addProvinceToCache(client, province);
        }
      }

      if (city) {
        const formattedCity = formatCityName(city);
        const cities = await findCities(formattedCity, newValues.province, baseOptions);
        if (cities.length > 0) {
          const city = cities[0]!;
          newValues.cityMunicipality = city.id;
          addCityToCache(client, city);
        }
      }

      if (barangay) {
        const barangays = await findBarangays(barangay, newValues.cityMunicipality, baseOptions);
        if (barangays.length > 0) {
          const barangay = barangays[0]!;
          newValues.barangay = barangay.id;
          addBarangayToCache(client, barangay);
        }
      }

      return { ...newValues, coordinates };
    },
    onError: (error) => {
      if (error instanceof ValidationError) {
        const message =
          'The selected place has invalid data. Please manually adjust the location on the map.';
        toast.error(message, { duration: Infinity, dismissible: true, id: TOAST_ID.ERROR });
      }
      console.error('Error selecting place:', error);
    },
  });
}
