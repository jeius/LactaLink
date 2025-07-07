import { DAYS, DELIVERY_OPTIONS } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { Address, DeliveryPreference } from '@lactalink/types';
import { DeliveryPreferenceSchema, deliveryPreferenceSchema } from '@lactalink/types/forms';
import { extractID } from '@lactalink/utilities';

import { useForm } from 'react-hook-form';

import { useEffect } from 'react';
import { useFetchById } from '../collections/useFetchById';
import { useFetchBySlug } from '../collections/useFetchBySlug';

export function useDeliveryPreferenceForm(id?: string) {
  const {
    data: preference,
    isLoading: isDPLoading,
    isFetching: isDPFetching,
    isSuccess: isDPSuccess,
    error: dpError,
  } = useFetchById(Boolean(id), {
    collection: 'delivery-preferences',
    id: id,
    select: { name: true, address: true, availableDays: true, preferredMode: true, owner: true },
    populate: { addresses: { displayName: true, name: true } },
  });

  const {
    data: defaultAddresses,
    isLoading: isAddressLoading,
    isFetching: isAddressFetching,
    isSuccess: isAddressSuccess,
    error: addressError,
  } = useFetchBySlug(Boolean(preference?.owner), {
    collection: 'addresses',
    limit: 1,
    depth: 0,
    select: { displayName: true, name: true, default: true, coordinates: true },
    where: {
      and: [
        { owner: { equals: preference?.owner ? extractID(preference.owner) : undefined } },
        { default: { equals: true } },
      ],
    },
  });

  const isLoading = isAddressLoading || isDPLoading;
  const isFetching = isAddressFetching || isDPFetching;
  const isSuccess = isAddressSuccess && isDPSuccess;
  const error = dpError || addressError;

  const defaultAddress = defaultAddresses?.[0] && extractID(defaultAddresses[0]);

  const form = useForm({
    resolver: zodResolver(deliveryPreferenceSchema),
    defaultValues: {
      address: defaultAddress,
      availableDays: Object.values(DAYS).map((item) => item.value),
      preferredMode: Object.values(DELIVERY_OPTIONS).map((item) => item.value),
    },
  });

  useEffect(() => {
    if (isSuccess && preference) {
      console.log('Setting form values for delivery preference:', preference);
      form.reset(extractDeliveryPreferenceValues(preference));
    }
  }, [form, isSuccess, preference]);

  return { form, isLoading, isFetching, isSuccess, data: preference, error };
}

function extractDeliveryPreferenceValues(data: DeliveryPreference): DeliveryPreferenceSchema {
  return {
    id: data.id,
    name: data.name || '',
    address: extractID(data.address as Address),
    availableDays: data.availableDays,
    preferredMode: data.preferredMode,
  };
}
