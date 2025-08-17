import { DAYS, DELIVERY_OPTIONS } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { Address } from '@lactalink/types';
import { deliveryPreferenceSchema } from '@lactalink/types/forms';
import { areStrings, extractID } from '@lactalink/utilities';

import { useForm } from 'react-hook-form';

import { useEffect } from 'react';
import { useMeUser } from '../auth/useAuth';
import { useFetchById } from '../collections/useFetchById';

export function useDeliveryPreferenceForm(id?: string) {
  const { data: user, ...meUser } = useMeUser();
  const {
    data: preference,
    isLoading: isDPLoading,
    isFetching: isDPFetching,
    isSuccess,
    error: dpError,
  } = useFetchById(Boolean(id), {
    collection: 'delivery-preferences',
    id: id,
    select: { name: true, address: true, availableDays: true, preferredMode: true, owner: true },
    depth: 0,
  });

  const userAddresses = user?.addresses?.docs || [];
  const defaultAddress =
    (!areStrings(userAddresses) &&
      (userAddresses as Address[]).find((address) => address.isDefault)) ||
    undefined;

  const isLoading = meUser.isLoading || isDPLoading;
  const isFetching = meUser.isFetching || isDPFetching;
  const error = dpError || meUser.error;

  const form = useForm({
    resolver: zodResolver(deliveryPreferenceSchema),
    defaultValues: {
      address: defaultAddress?.id,
      availableDays: Object.values(DAYS).map((item) => item.value),
      preferredMode: Object.values(DELIVERY_OPTIONS).map((item) => item.value),
    },
  });

  useEffect(() => {
    if (isSuccess && preference) {
      const data = preference;
      form.reset({
        id: data.id,
        name: data.name || '',
        address: extractID(data.address),
        availableDays: data.availableDays,
        preferredMode: data.preferredMode,
      });
    }
  }, [form, isSuccess, preference]);

  return { form, isLoading, isFetching, isSuccess, data: preference, error };
}
