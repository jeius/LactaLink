import { zodResolver } from '@hookform/resolvers/zod';
import {
  createDeliveryPreferenceSchema,
  DeliveryPreferenceCreateSchema,
  deliveryPreferenceSchema,
  DeliveryPreferenceSchema,
} from '@lactalink/form-schemas';

import { extractCollection } from '@lactalink/utilities/extractors';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { FormProps } from '@/components/contexts/FormProvider';
import {
  transformToAddressSchema,
  transformToDeliveryPreferenceSchema,
} from '@/lib/utils/transformData';
import { useMeUser } from '../auth/useAuth';
import { useFetchById } from '../collections/useFetchById';

type InputType = string | undefined | null;

type FormReturnType<T extends InputType> = T extends string
  ? FormProps<DeliveryPreferenceSchema>
  : FormProps<DeliveryPreferenceCreateSchema>;

export function useDeliveryPreferenceForm<T extends InputType = undefined>(
  id: T
): FormReturnType<T> {
  const { data: user, ...meUser } = useMeUser();

  const {
    data: preference,
    isLoading: isDPLoading,
    isFetching: isDPFetching,
    error: dpError,
    ...fetchQuery
  } = useFetchById(!!id, {
    collection: 'delivery-preferences',
    id: id || '',
  });

  const defaultAddress = useMemo(() => {
    const userAddresses = extractCollection(user?.addresses?.docs) || [];
    return userAddresses.find((address) => address.isDefault) || undefined;
  }, [user?.addresses?.docs]);

  const isLoading = meUser.isLoading || isDPLoading;
  const isFetching = meUser.isFetching || isDPFetching;
  const error = dpError || meUser.error;

  const form = useForm({
    resolver: zodResolver(id ? deliveryPreferenceSchema : createDeliveryPreferenceSchema),
    defaultValues: {
      address: transformToAddressSchema(defaultAddress),
      availableDays: [],
      preferredMode: [],
    },
  });

  useEffect(() => {
    if (id && preference) {
      const data = transformToDeliveryPreferenceSchema(preference);
      form.reset(data);
    }
  }, [form, id, preference]);

  return {
    ...form,
    isLoading,
    isFetching,
    fetchError: error,
    refreshing: fetchQuery.isRefetching,
    extraData: preference,
    onRefresh() {
      fetchQuery.refetch();
    },
  } as FormReturnType<T>;
}
