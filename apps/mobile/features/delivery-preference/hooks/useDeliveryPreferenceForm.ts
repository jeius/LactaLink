import { zodResolver } from '@hookform/resolvers/zod';
import {
  createDeliveryPreferenceSchema,
  DeliveryPreferenceCreateSchema,
  deliveryPreferenceSchema,
  DeliveryPreferenceSchema,
} from '@lactalink/form-schemas';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { FormProps } from '@/components/contexts/FormProvider';
import { transformToDeliveryPreferenceSchema } from '@/lib/utils/transformData';
import { useDeliveryPreference } from './queries';

type InputType = string | undefined | null;

type FormReturnType<T extends InputType> = T extends string
  ? FormProps<DeliveryPreferenceSchema>
  : FormProps<DeliveryPreferenceCreateSchema>;

export function useDeliveryPreferenceForm<T extends InputType = undefined>(
  id: T
): FormReturnType<T> {
  const { data: preference, isLoading, isFetching, error, ...query } = useDeliveryPreference(id);

  const form = useForm({
    resolver: zodResolver(id ? deliveryPreferenceSchema : createDeliveryPreferenceSchema),
    defaultValues: {
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
    refreshing: query.isRefetching,
    extraData: preference,
    onRefresh() {
      query.refetch();
    },
  } as FormReturnType<T>;
}
