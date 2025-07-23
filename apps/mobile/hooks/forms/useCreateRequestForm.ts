import { requestStorage } from '@/lib/localStorage';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Hospital,
  Individual,
  MilkBank,
  requestSchema,
  RequestSchema,
  User,
} from '@lactalink/types';

import { extractID } from '@lactalink/utilities';
import { debounce } from 'lodash';
import { useEffect, useMemo } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';
import { useFetchById } from '../collections/useFetchById';

const storageKeyPrefix = 'create-request-form';

type Params = {
  requestedDonorId?: string;
  matchedDonation?: string;
  user: User | null;
  profile: Individual | Hospital | MilkBank | null;
};

function getStoredData({ user, requestedDonorId, profile }: Params): RequestSchema | undefined {
  if (!user) return undefined;

  const id = user.id;
  const storageKey = `${storageKeyPrefix}-${id}`;
  const raw = requestStorage.getString(storageKey);

  const storedData: DeepPartial<RequestSchema> | undefined = raw && JSON.parse(raw);
  const requester = profile?.id;

  return {
    requester: storedData?.requester || requester,
    requestedDonor: storedData?.requestedDonor || requestedDonorId,
    volumeNeeded: storedData?.volumeNeeded || 20,
    deliveryPreferences: storedData?.deliveryPreferences || [],
    details: {
      ...storedData?.details,
      reason: storedData?.details?.reason || '',
      notes: storedData?.details?.notes || '',
      storagePreference: storedData?.details?.storagePreference || 'EITHER',
    },
  } as RequestSchema;
}

export const useCreateRequestForm = ({
  requestedDonorId,
  user,
  profile,
  matchedDonation,
}: Params) => {
  const preferences = useMemo(() => user?.deliveryPreferences?.docs || [], [user]);

  const {
    data: matchedDonationDoc,
    isLoading,
    isFetching,
    error,
  } = useFetchById(Boolean(matchedDonation), {
    collection: 'donations',
    id: matchedDonation,
    populate: { users: { profile: true, profileType: true, role: true } },
  });

  const form = useForm({
    resolver: zodResolver(requestSchema),
    mode: 'onTouched',
    defaultValues: getStoredData({ user, requestedDonorId, profile }),
  });

  const storageKey = `${storageKeyPrefix}-${user?.id || ''}`;
  const isSubmitSuccessful = form.formState.isSubmitSuccessful;
  const getValues = form.getValues;

  const debouncedSave = debounce((value: DeepPartial<RequestSchema>) => {
    requestStorage.set(storageKey, JSON.stringify(value));
  }, 1000);

  useEffect(() => {
    if (!isLoading && preferences?.length) {
      const data = form.getValues();

      if (preferences?.length) {
        data.deliveryPreferences = extractID(preferences);
      }

      if (matchedDonationDoc) {
        const storagePreference = matchedDonationDoc.details.storageType;

        data.matchedDonation = {
          id: matchedDonationDoc.id,
          donor: extractID(matchedDonationDoc.donor),
          storageType: storagePreference,
          bags: extractID(matchedDonationDoc.details.bags),
        };

        data.details.storagePreference = storagePreference;
      }

      form.reset(data);
    }
  }, [isLoading, preferences, form, form.getValues, matchedDonationDoc]);

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

        const values: DeepPartial<RequestSchema> = {
          details: {
            notes: data.details.notes,
            reason: data.details.reason,
            storagePreference: data.details.storagePreference,
          },
          deliveryPreferences: data.deliveryPreferences,
        };

        // Save the preffered values to local storage
        requestStorage.set(storageKey, JSON.stringify(values));
      }
    }

    saveUserPreference();
  }, [isSubmitSuccessful, getValues, storageKey]);

  return { form, isLoading, isFetching, error };
};
