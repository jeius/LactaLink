import { DAYS, DELIVERY_OPTIONS } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DeliveryPreference,
  DeliveryPreferenceSchema,
  deliveryPreferenceSchema,
} from '@lactalink/types';
import { extractErrorMessage, extractID } from '@lactalink/utilities';

import { useForm } from 'react-hook-form';

import { getApiClient } from '@lactalink/api';
import { toast } from 'sonner-native';
import { useFetchById } from '../collections/useFetchById';

export function useDeliveryPreferenceForm(id?: string | null) {
  const { data, isLoading, isFetching, isSuccess, refetch } = useFetchById(Boolean(id), {
    collection: 'delivery-preferences',
    depth: 0,
    select: { name: true, address: true, availableDays: true, preferredMode: true },
  });

  const form = useForm({
    resolver: zodResolver(deliveryPreferenceSchema),
    defaultValues: createDefaultValues(data),
  });

  const submit = form.handleSubmit(onSubmit);

  async function onSubmit(formData: DeliveryPreferenceSchema) {
    const promise = upsertDeliveryPreference(formData);

    toast.promise(promise, {
      loading: 'Saving delivery preference...',
      success: (res: { message: string }) => {
        return res.message;
      },
      error: (error) => {
        return extractErrorMessage(error);
      },
    });

    const { data } = await promise;

    form.reset(createDefaultValues(data));
    refetch();
  }

  return { form, isLoading, isFetching, isSuccess, data, submit };
}

function createDefaultValues(data?: DeliveryPreference | null): DeliveryPreferenceSchema {
  return {
    id: data?.id,
    name: data?.name || '',
    address: data ? extractID(data.address) : undefined,
    availableDays: data?.availableDays || Object.values(DAYS).map((item) => item.value),
    preferredMode: data?.preferredMode || Object.values(DELIVERY_OPTIONS).map((item) => item.value),
  } as DeliveryPreferenceSchema;
}

async function upsertDeliveryPreference(data: DeliveryPreferenceSchema) {
  const apiClient = getApiClient();

  let message: string;
  let preference: DeliveryPreference;

  if (data.id) {
    preference = await apiClient.updateByID({
      collection: 'delivery-preferences',
      id: data.id,
      data: {
        name: data.name,
        address: data.address,
        availableDays: data.availableDays,
        preferredMode: data.preferredMode,
      },
    });

    message = `"${preference.name || 'Delivery Preference'}" updated successfully.`;
  }

  preference = await apiClient.create({
    collection: 'delivery-preferences',
    data: {
      name: data.name,
      address: data.address,
      availableDays: data.availableDays,
      preferredMode: data.preferredMode,
    },
  });

  message = `"${preference.name || 'Delivery Preference'}" created successfully.`;

  return { message, data: preference };
}
