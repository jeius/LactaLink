import { donationStorage } from '@/lib/localStorage';
import { zodResolver } from '@hookform/resolvers/zod';
import { getApiClient } from '@lactalink/api';
import {
  createDonationSchema,
  CreateDonationSchema,
  Hospital,
  Individual,
  MilkBank,
  User,
} from '@lactalink/types';

import { DAYS } from '@/lib/constants';

import { useQuery } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { useEffect } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';

const storageKeyPrefix = 'create-donation-form';

type Params = {
  recipientId?: string;
  user: User | null;
  profile: Individual | Hospital | MilkBank | null;
};

function getStoredData({ user, recipientId, profile }: Params): CreateDonationSchema | undefined {
  if (!user) return undefined;

  const id = user.id;
  const storageKey = `${storageKeyPrefix}-${id}`;
  const raw = donationStorage.getString(storageKey);

  const storedData: DeepPartial<CreateDonationSchema> | undefined = raw && JSON.parse(raw);
  const donor = profile?.id;
  const deliveryDetails = storedData?.deliveryDetails || [
    {
      preferredMode: ['PICKUP'],
      availableDays: [Object.values(DAYS).map((day) => day.value)],
    },
  ];

  return {
    donor: storedData?.donor || donor,
    recipient: storedData?.recipient || recipientId,
    deliveryDetails,
    details: {
      notes: storedData?.details?.notes || '',
      collectionMode: storedData?.details?.collectionMode,
      storageType: storedData?.details?.storageType,
      milkSample: storedData?.details?.milkSample,
      bags: storedData?.details?.bags || [
        { donor, volume: 20, quantity: 1, collectedAt: new Date().toISOString() },
      ],
    },
  } as CreateDonationSchema;
}

async function getDeliveryPreferences(
  user: User | null
): Promise<CreateDonationSchema['deliveryDetails'] | undefined> {
  if (!user) return undefined;

  const apiClient = getApiClient();
  const deliveryPreferences = await apiClient.find({
    collection: 'delivery-preferences',
    where: { owner: { equals: user.id } },
    depth: 0,
    pagination: false,
  });

  return deliveryPreferences.map((detail) => ({
    address: detail.address as string,
    preferredMode: detail.preferredMode,
    availableDays: detail.availableDays,
    id: detail.id,
  }));
}

export const useCreateDonationForm = ({ recipientId, user, profile }: Params) => {
  const {
    data: deliveryDetails,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['create-donation-form', user?.id],
    queryFn: () => getDeliveryPreferences(user),
    // staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });

  const form = useForm({
    resolver: zodResolver(createDonationSchema),
    mode: 'onTouched',
    defaultValues: getStoredData({ user, recipientId, profile }),
  });

  const storageKey = `${storageKeyPrefix}-${user?.id || ''}`;
  const isSubmitSuccessful = form.formState.isSubmitSuccessful;
  const getValues = form.getValues;

  const debouncedSave = debounce((value: DeepPartial<CreateDonationSchema>) => {
    donationStorage.set(storageKey, JSON.stringify(value));
  });

  useEffect(() => {
    if (!isLoading && deliveryDetails?.length) {
      form.reset({
        ...form.getValues(),
        deliveryDetails: deliveryDetails,
      });
    }
  }, [isLoading, deliveryDetails, form, form.getValues]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      debouncedSave(value);
    });

    return () => {
      subscription.unsubscribe();
      debouncedSave.cancel();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch, debouncedSave]);

  /**
   * When the form is successfully submitted, clear the local storage
   * and save the user preference to local storage.
   */
  useEffect(() => {
    async function saveUserPreference() {
      if (isSubmitSuccessful) {
        donationStorage.delete(storageKey);

        const data = getValues();

        // Pick the preffered values from the form
        const deliveryDetails = (await refetch()).data;

        if (deliveryDetails) {
          data.deliveryDetails = deliveryDetails;
        }

        const values: DeepPartial<CreateDonationSchema> = {
          details: {
            notes: data.details.notes,
            collectionMode: data.details.collectionMode,
            storageType: data.details.storageType,
          },
          deliveryDetails: data.deliveryDetails,
        };

        // Save the preffered values to local storage
        donationStorage.set(storageKey, JSON.stringify(values));
      }
    }

    saveUserPreference();
  }, [isSubmitSuccessful, getValues, storageKey, refetch]);

  return { form, isLoading };
};
