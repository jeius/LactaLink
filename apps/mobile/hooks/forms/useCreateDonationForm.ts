import { donationStorage } from '@/lib/localStorage';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DonationSchema,
  donationSchema,
  Hospital,
  Individual,
  MilkBank,
  User,
} from '@lactalink/types';

import { extractID } from '@lactalink/utilities';
import { debounce } from 'lodash';
import { useEffect, useMemo } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';
import { useFetchById } from '../collections/useFetchById';

const storageKeyPrefix = 'donation-form';

type Params = {
  matchedRequest?: string;
  user: User | null;
  profile: Individual | Hospital | MilkBank | null;
};

export const useCreateDonationForm = ({ matchedRequest, user, profile }: Params) => {
  const preferences = useMemo(() => user?.deliveryPreferences?.docs || [], [user]);

  const {
    data: matchedRequestDoc,
    isLoading,
    isFetching,
    error,
  } = useFetchById(Boolean(matchedRequest), {
    collection: 'requests',
    id: matchedRequest,
    populate: { users: { profile: true, profileType: true, role: true } },
  });

  const form = useForm({
    resolver: zodResolver(donationSchema),
    mode: 'onTouched',
    defaultValues: getData({ user, profile }),
  });

  const storageKey = `${storageKeyPrefix}-${user?.id || ''}`;
  const isSubmitSuccessful = form.formState.isSubmitSuccessful;
  const getValues = form.getValues;

  const debouncedSave = debounce((value: DeepPartial<DonationSchema>) => {
    donationStorage.set(storageKey, JSON.stringify(value));
  }, 1000);

  useEffect(() => {
    if (!isLoading) {
      const data = form.getValues();

      if (preferences?.length) {
        data.deliveryPreferences = extractID(preferences);
      }

      if (matchedRequestDoc && matchedRequest) {
        const storagePreference = matchedRequestDoc.details.storagePreference || 'EITHER';
        const volumeNeeded = matchedRequestDoc.volumeNeeded;

        data.matchedRequest = {
          id: matchedRequestDoc.id,
          requester: extractID(matchedRequestDoc.requester),
          volumeNeeded,
          storagePreference,
        };

        data.details.storageType = storagePreference === 'EITHER' ? 'FRESH' : storagePreference;
        data.details.bags = [
          {
            collectedAt: new Date().toISOString(),
            volume: volumeNeeded,
            quantity: 1,
            donor: data.donor,
          },
        ];
      }

      form.reset(data);
    }
  }, [isLoading, preferences, form, matchedRequestDoc, matchedRequest]);

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

        const values: DeepPartial<DonationSchema> = {
          details: {
            notes: data.details.notes,
            collectionMode: data.details.collectionMode,
            storageType: data.details.storageType,
          },
          deliveryPreferences: data.deliveryPreferences,
        };

        // Save the preffered values to local storage
        donationStorage.set(storageKey, JSON.stringify(values));
      }
    }

    saveUserPreference();
  }, [isSubmitSuccessful, getValues, storageKey]);

  return { form, isLoading, isFetching, error };
};

function getData({ user, profile }: Params): DonationSchema | undefined {
  const storedData = getStoredData(user);

  const donor = profile?.id;

  return {
    donor: storedData?.donor || donor,
    deliveryPreferences: storedData?.deliveryPreferences || [],
    details: {
      notes: storedData?.details?.notes || '',
      collectionMode: storedData?.details?.collectionMode,
      storageType: storedData?.details?.storageType,
      milkSample: storedData?.details?.milkSample,
      bags: storedData?.details?.bags || [
        { donor, volume: 20, quantity: 1, collectedAt: new Date().toISOString() },
      ],
    },
  } as DonationSchema;
}

function getStoredData(user: User | null): DeepPartial<DonationSchema> | undefined {
  if (!user) return undefined;
  const userID = user.id;
  const storageKey = `${storageKeyPrefix}-${userID}`;
  const raw = donationStorage.getString(storageKey);
  return raw && JSON.parse(raw);
}
