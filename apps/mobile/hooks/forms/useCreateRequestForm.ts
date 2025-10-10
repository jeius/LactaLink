import { requestStorage } from '@/lib/localStorage';
import { requestSchema, RequestSchema } from '@lactalink/form-schemas';

import { User } from '@lactalink/types/payload-generated-types';
import { createStorageKeyByUser } from '@lactalink/utilities';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';

import { zodResolver } from '@hookform/resolvers/zod';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import { useEffect, useMemo } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';

const BASE_STORAGE_KEY = 'create-request-form';

type Params = {
  recipient?: { value: string; relationTo: NonNullable<User['profile']>['relationTo'] };
  matchedDonation?: string;
  user: User | null;
};

export const useCreateRequestForm = ({ user, matchedDonation, recipient }: Params) => {
  const preferences = useMemo(() => user?.deliveryPreferences?.docs || [], [user]);

  const storageKey = useMemo(() => createStorageKeyByUser(user, BASE_STORAGE_KEY), [user]);

  const form = useForm({
    resolver: zodResolver(requestSchema),
    mode: 'onTouched',
    defaultValues: getStoredData(user, storageKey),
  });

  const isSubmitSuccessful = form.formState.isSubmitSuccessful;
  const getValues = form.getValues;
  const reset = form.reset;

  const debouncedSave = useMemo(
    () =>
      debounce((value: DeepPartial<RequestSchema>) => {
        requestStorage.set(storageKey, JSON.stringify(value));
      }, 200),
    [storageKey]
  );

  useEffect(() => {
    const data = getValues();

    if (!matchedDonation) {
      data.matchedDonation = undefined;
    } else {
      data.volumeNeeded = 20;
    }

    if (preferences?.length && !data.deliveryPreferences?.length) {
      data.deliveryPreferences = preferences
        .map((pref) => {
          const preference = extractCollection(pref);
          if (!preference) return null;
          return { ...preference, address: extractID(preference.address) };
        })
        .filter((v) => v !== null);
    }

    data.recipient = recipient;

    if (!isEqual(data, getValues())) {
      reset(data);
    }
  }, [preferences, reset, recipient, getValues, matchedDonation]);

  // Watch form changes and save to local storage (debounced).
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

        const preferredValues: DeepPartial<RequestSchema> = {
          details: {
            notes: data.details.notes,
            reason: data.details.reason,
            storagePreference: data.details.storagePreference,
          },
          deliveryPreferences: data.deliveryPreferences,
        };

        // Save the preffered values to local storage
        debouncedSave(preferredValues);
      }
    }

    saveUserPreference();
  }, [isSubmitSuccessful, getValues, storageKey, debouncedSave]);

  return { form };
};

function getStoredData(user: User | null, storageKey: string): RequestSchema | undefined {
  if (!user) return undefined;
  const profile = extractCollection(user.profile?.value);

  const raw = requestStorage.getString(storageKey);

  const storedData: DeepPartial<RequestSchema> | undefined = raw && JSON.parse(raw);
  const requester = profile?.id;

  return {
    requester: storedData?.requester || requester,
    volumeNeeded: storedData?.volumeNeeded || 20,
    deliveryPreferences: storedData?.deliveryPreferences || [],
    details: {
      ...storedData?.details,
      bags: storedData?.details?.bags || [],
      reason: storedData?.details?.reason || '',
      notes: storedData?.details?.notes || '',
      storagePreference: storedData?.details?.storagePreference || 'EITHER',
    },
  } as RequestSchema;
}
