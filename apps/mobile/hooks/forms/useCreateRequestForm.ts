import { requestStorage } from '@/lib/localStorage';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateRequestSchema,
  createRequestSchema,
  Hospital,
  Individual,
  MilkBank,
  User,
} from '@lactalink/types';

import { DAYS, DELIVERY_OPTIONS } from '@/lib/constants';

import { extractID } from '@lactalink/utilities';
import { debounce } from 'lodash';
import { useEffect } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';
import { useFetchBySlug } from '../collections/useFetchBySlug';

const storageKeyPrefix = 'create-request-form';

type Params = {
  requestedDonorId?: string;
  user: User | null;
  profile: Individual | Hospital | MilkBank | null;
};

function getStoredData({
  user,
  requestedDonorId,
  profile,
}: Params): CreateRequestSchema | undefined {
  if (!user) return undefined;

  const id = user.id;
  const storageKey = `${storageKeyPrefix}-${id}`;
  const raw = requestStorage.getString(storageKey);

  const storedData: DeepPartial<CreateRequestSchema> | undefined = raw && JSON.parse(raw);
  const requester = profile?.id;
  const deliveryDetails = storedData?.deliveryDetails || [
    {
      preferredMode: Object.values(DELIVERY_OPTIONS).map((day) => day.value),
      availableDays: Object.values(DAYS).map((day) => day.value),
    },
  ];

  return {
    requester: storedData?.requester || requester,
    requestedDonor: storedData?.requestedDonor || requestedDonorId,
    volumeNeeded: storedData?.volumeNeeded || 20,
    deliveryDetails,
    details: {
      ...storedData?.details,
      reason: storedData?.details?.reason || '',
      notes: storedData?.details?.notes || '',
      storagePreference: storedData?.details?.storagePreference || 'EITHER',
    },
  } as CreateRequestSchema;
}

export const useCreateRequestForm = ({ requestedDonorId, user, profile }: Params) => {
  const {
    data: preferences,
    refetch,
    isLoading,
    isFetching,
  } = useFetchBySlug(true, {
    collection: 'delivery-preferences',
    where: { owner: { equals: user?.id } },
    depth: 0,
    sort: 'createdAt',
  });

  const form = useForm({
    resolver: zodResolver(createRequestSchema),
    mode: 'onTouched',
    defaultValues: getStoredData({ user, requestedDonorId, profile }),
  });

  const storageKey = `${storageKeyPrefix}-${user?.id || ''}`;
  const isSubmitSuccessful = form.formState.isSubmitSuccessful;
  const getValues = form.getValues;

  const debouncedSave = debounce((value: DeepPartial<CreateRequestSchema>) => {
    requestStorage.set(storageKey, JSON.stringify(value));
  }, 1000);

  useEffect(() => {
    if (!isLoading && preferences?.length) {
      form.reset({
        ...form.getValues(),
        deliveryDetails: preferences.map((detail) => ({
          ...detail,
          address: extractID(detail.address),
        })),
      });
    }
  }, [isLoading, preferences, form, form.getValues]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      debouncedSave(value);
    });

    return () => {
      subscription.unsubscribe();
      debouncedSave.cancel();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * When the form is successfully submitted, clear the local storage
   * and save the user preference to local storage.
   */
  useEffect(() => {
    async function saveUserPreference() {
      if (isSubmitSuccessful) {
        requestStorage.delete(storageKey);

        const data = getValues();
        const preferences = (await refetch()).data;

        if (preferences?.length) {
          data.deliveryDetails = preferences.map((detail) => ({
            ...detail,
            address: extractID(detail.address),
          }));
        }

        const values: DeepPartial<CreateRequestSchema> = {
          details: {
            notes: data.details.notes,
            reason: data.details.reason,
            storagePreference: data.details.storagePreference,
          },
          deliveryDetails: data.deliveryDetails,
        };

        // Save the preffered values to local storage
        requestStorage.set(storageKey, JSON.stringify(values));
      }
    }

    saveUserPreference();
  }, [isSubmitSuccessful, getValues, storageKey, refetch]);

  return { form, isLoading, isFetching };
};
