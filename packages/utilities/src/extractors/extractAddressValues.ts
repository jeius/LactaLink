import { Address } from '@lactalink/types';
import { DeliveryPreferenceSchema } from '@lactalink/types/forms';
import { extractID } from './extractID';

export function extractAddressValues(data: Address): DeliveryPreferenceSchema['address'] {
  const [latitude, longitude] = data.coordinates || [undefined, undefined];
  return {
    id: data.id,
    name: data.name || '',
    displayName: data.displayName || '',
    street: data.street || '',
    province: extractID(data.province),
    cityMunicipality: extractID(data.cityMunicipality),
    barangay: data.barangay ? extractID(data.barangay) : undefined,
    default: data.default || undefined,
    coordinates: latitude && longitude ? { latitude, longitude } : undefined,
    zipCode: data.zipCode || '',
  };
}
