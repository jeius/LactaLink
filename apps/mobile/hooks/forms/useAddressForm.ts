import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema } from '@lactalink/types/forms';
import { extractID } from '@lactalink/utilities';

import { useForm } from 'react-hook-form';

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
    id: id,
    depth: 0,
  });

  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: '',
      default: true,
      street: '',
      zipCode: '',
    },
  });

  useEffect(() => {
    if (isSuccess && address) {
      const data = address;
      const [latitude, longitude] = data.coordinates || [undefined, undefined];

      form.reset({
        id: data.id,
        name: data.name || '',
        zipCode: data.zipCode || '',
        street: data.street || '',
        province: extractID(data.province),
        barangay: data.barangay && extractID(data.barangay),
        cityMunicipality: extractID(data.cityMunicipality),
        default: data.default || false,
        coordinates: (latitude && longitude && { latitude, longitude }) || undefined,
      });
    }
  }, [form, isSuccess, address]);

  return { form, isLoading, isFetching, isSuccess, data: address, error };
}
