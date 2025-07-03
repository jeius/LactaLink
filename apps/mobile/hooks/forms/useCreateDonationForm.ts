import { donationStorage } from '@/lib/localStorage';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createDonationSchema,
  CreateDonationSchema,
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

const storageKeyPrefix = 'create-donation-form';

type Params = {
  recipientId?: string;
  user: User | null;
  profile: Individual | Hospital | MilkBank | null;
};

function getStoredData({ user, recipientId, profile }: Params): CreateDonationSchema | undefined {
  if (!user) return undefined;

  const userID = user.id;
  const storageKey = `${storageKeyPrefix}-${userID}`;
  const raw = donationStorage.getString(storageKey);

  const storedData: DeepPartial<CreateDonationSchema> | undefined = raw && JSON.parse(raw);
  const donor = profile?.id;
  const deliveryDetails = storedData?.deliveryDetails || [
    {
      preferredMode: [DELIVERY_OPTIONS.PICKUP.value],
      availableDays: Object.values(DAYS).map((day) => day.value),
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

export const useCreateDonationForm = ({ recipientId, user, profile }: Params) => {
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
    resolver: zodResolver(createDonationSchema),
    mode: 'onTouched',
    defaultValues: getStoredData({ user, recipientId, profile }),
  });

  const storageKey = `${storageKeyPrefix}-${user?.id || ''}`;
  const isSubmitSuccessful = form.formState.isSubmitSuccessful;
  const getValues = form.getValues;

  const debouncedSave = debounce((value: DeepPartial<CreateDonationSchema>) => {
    donationStorage.set(storageKey, JSON.stringify(value));
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
        donationStorage.delete(storageKey);

        const data = getValues();
        const preferences = (await refetch()).data;

        if (preferences?.length) {
          data.deliveryDetails = preferences.map((detail) => ({
            ...detail,
            address: extractID(detail.address),
          }));
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

  return { form, isLoading, isFetching };
};
