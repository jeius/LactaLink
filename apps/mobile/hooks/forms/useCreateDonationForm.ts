import { donationStorage } from '@/lib/localStorage';
import { zodResolver } from '@hookform/resolvers/zod';
import { getApiClient } from '@lactalink/api';
import {
  Address,
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

async function getInitialData({
  user,
  recipientId,
  profile,
}: Params): Promise<CreateDonationSchema | undefined> {
  if (!user) return undefined;

  const apiClient = getApiClient();
  const deliveryPreferences = await apiClient.find({
    collection: 'delivery-preferences',
    where: { owner: { equals: user.id } },
    depth: 0,
    pagination: false,
  });

  const id = user.id;
  const storageKey = `${storageKeyPrefix}-${id}`;
  const raw = donationStorage.getString(storageKey);

  const initialData: DeepPartial<CreateDonationSchema> | undefined = raw && JSON.parse(raw);
  const donor = profile?.id;

  const defaultAddressId = (
    profile?.addresses.find((address) => (address as Address)?.default) as Address | undefined
  )?.id;

  const deliveryDetails =
    deliveryPreferences.length > 0
      ? deliveryPreferences
      : initialData?.deliveryDetails?.map((detail) => ({
          id: detail?.id,
          preferredMode: detail?.preferredMode || 'PICKUP',
          address: detail?.address || defaultAddressId || '',
          availableDays: detail?.availableDays || Object.values(DAYS).map((day) => day.value),
        })) || [
          {
            preferredMode: 'PICKUP',
            address: defaultAddressId || '',
            availableDays: Object.values(DAYS).map((day) => day.value),
          },
        ];

  return {
    donor: initialData?.donor || donor,
    recipient: initialData?.recipient || recipientId,
    deliveryDetails,
    details: {
      notes: initialData?.details?.notes || '',
      collectionMode: initialData?.details?.collectionMode,
      storageType: initialData?.details?.storageType || 'FROZEN',
      milkSample: initialData?.details?.milkSample,
      bags: initialData?.details?.bags || [
        { donor, volume: 20, quantity: 1, collectedAt: new Date().toISOString() },
      ],
    },
  } as CreateDonationSchema;
}

export const useCreateDonationForm = ({ recipientId, user, profile }: Params) => {
  const { data: initialData, refetch } = useQuery({
    queryKey: ['create-donation-form', user?.id],
    queryFn: () => {
      return getInitialData({ recipientId, user, profile });
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });

  const form = useForm({
    resolver: zodResolver(createDonationSchema),
    mode: 'onTouched',
    defaultValues: initialData || undefined,
  });

  const storageKey = `${storageKeyPrefix}-${user?.id || ''}`;
  const isSubmitSuccessful = form.formState.isSubmitSuccessful;
  const getValues = form.getValues;

  const debouncedSave = debounce((value: DeepPartial<CreateDonationSchema>) => {
    donationStorage.set(storageKey, JSON.stringify(value));
  });

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

        // Pick the preffered values from the form
        const {
          details: { notes, collectionMode, storageType },
          deliveryDetails,
        } = (await refetch()).data || getValues();

        const values: DeepPartial<CreateDonationSchema> = {
          details: { notes, collectionMode, storageType },
          deliveryDetails,
        };

        // Save the preffered values to local storage
        donationStorage.set(storageKey, JSON.stringify(values));
      }
    }

    saveUserPreference();
  }, [isSubmitSuccessful, getValues, storageKey, refetch]);

  return form;
};
