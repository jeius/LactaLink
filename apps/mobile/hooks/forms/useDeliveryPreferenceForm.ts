import { COLLECTION_QUERY_KEY, DAYS, DELIVERY_OPTIONS } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { Address, DeliveryPreference } from '@lactalink/types';
import { DeliveryPreferenceSchema, deliveryPreferenceSchema } from '@lactalink/types/forms';
import { extractAddressValues, extractErrorMessage, extractID } from '@lactalink/utilities';

import { useForm } from 'react-hook-form';

import { getApiClient } from '@lactalink/api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { useFetchById } from '../collections/useFetchById';
import { useFetchBySlug } from '../collections/useFetchBySlug';

export function useDeliveryPreferenceForm(id?: string | null) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: isDPLoading,
    isFetching: isDPFetching,
    isSuccess: isDPSuccess,
  } = useFetchById(Boolean(id), {
    collection: 'delivery-preferences',
    depth: 0,
    select: { name: true, address: true, availableDays: true, preferredMode: true, owner: true },
    populate: { addresses: { displayName: true, name: true } },
  });

  const {
    data: defaultAddresses,
    isLoading: isAddressLoading,
    isFetching: isAddressFetching,
    isSuccess: isAddressSuccess,
  } = useFetchBySlug(Boolean(data?.owner), {
    collection: 'addresses',
    limit: 1,
    depth: 0,
    select: { displayName: true, name: true, default: true, coordinates: true },
    where: {
      and: [
        { owner: { equals: data?.owner ? extractID(data.owner) : undefined } },
        { default: { equals: true } },
      ],
    },
  });

  const isLoading = isAddressLoading || isDPLoading;
  const isFetching = isAddressFetching || isDPFetching;
  const isSuccess = isAddressSuccess && isDPSuccess;

  const defaultAddress = defaultAddresses?.[0] && extractAddressValues(defaultAddresses[0]);

  const form = useForm({
    resolver: zodResolver(deliveryPreferenceSchema),
    defaultValues: createDefaultValue(data, defaultAddress),
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

    form.reset(createDefaultValue(data));
    queryClient.invalidateQueries({
      queryKey: COLLECTION_QUERY_KEY,
    });
  }

  return { form, isLoading, isFetching, isSuccess, data, submit };
}

function createDefaultValue(
  data?: DeliveryPreference | null,
  defaultAddress?: DeliveryPreferenceSchema['address'] | null
): DeliveryPreferenceSchema {
  return {
    id: data?.id,
    name: data?.name || '',
    address: data ? extractAddressValues(data.address as Address) : defaultAddress,
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
        address: data.address.id,
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
      address: data.address.id,
      availableDays: data.availableDays,
      preferredMode: data.preferredMode,
    },
  });

  message = `"${preference.name || 'Delivery Preference'}" created successfully.`;

  return { message, data: preference };
}
