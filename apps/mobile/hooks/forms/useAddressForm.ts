import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema } from '@lactalink/types/forms';
import { extractID } from '@lactalink/utilities/extractors';

import { useForm } from 'react-hook-form';

import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import { useEffect } from 'react';
import { useFetchById } from '../collections/useFetchById';

export function useAddressForm(id?: string) {
  const {
    data: address,
    isLoading,
    isFetching,
    isSuccess,
    error,
  } = useFetchById(Boolean(id), {
    collection: 'addresses',
    id: id || '',
    depth: 0,
  });

  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: '',
      isDefault: false,
      street: '',
      zipCode: '',
    },
  });

  const reset = form.reset;

  useEffect(() => {
    if (isSuccess && address) {
      const data = address;
      const coordinates = data.coordinates && pointToLatLng(data.coordinates);

      reset({
        id: data.id,
        name: data.name || '',
        zipCode: data.zipCode || '',
        street: data.street || '',
        province: extractID(data.province),
        barangay: (data.barangay && extractID(data.barangay)) || undefined,
        cityMunicipality: extractID(data.cityMunicipality),
        isDefault: data.isDefault || false,
        coordinates: coordinates || undefined,
      });
    }
  }, [reset, isSuccess, address]);

  return { form, isLoading, isFetching, isSuccess, data: address, error };
}
