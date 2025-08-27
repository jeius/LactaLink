import { requestStorage } from '@/lib/localStorage';
import { zodResolver } from '@hookform/resolvers/zod';
import { MilkBagSchema, requestSchema, RequestSchema, User } from '@lactalink/types';

import { extractMilkBagSchema } from '@/lib/utils/extractMilkBagShema';
import { getNearestDeliveryPreference } from '@/lib/utils/getNearestDeliveryPreference';
import { extractCollection, extractID } from '@lactalink/utilities';

import { debounce, isEqual } from 'lodash';
import { useEffect, useMemo } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';

import { useFetchById } from '../collections/useFetchById';

const storageKeyPrefix = 'create-request-form';

type Params = {
  recipient?: { value: string; relationTo: NonNullable<User['profile']>['relationTo'] };
  matchedDonation?: string;
  user: User | null;
};

export const useCreateRequestForm = ({ user, matchedDonation, recipient }: Params) => {
  const preferences = useMemo(() => user?.deliveryPreferences?.docs || [], [user]);

  const { data: matchedDonationDoc, ...restOfQuery } = useFetchById(Boolean(matchedDonation), {
    collection: 'donations',
    id: matchedDonation,
  });

  const form = useForm({
    resolver: zodResolver(requestSchema),
    mode: 'onTouched',
    defaultValues: getStoredData({ user }),
  });

  const storageKey = `${storageKeyPrefix}-${user?.id || ''}`;
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

  const formData = getValues();

  useEffect(() => {
    const data = getValues();

    if (preferences?.length && !data.deliveryPreferences?.length) {
      data.deliveryPreferences = extractID(preferences);
    }

    if (recipient) {
      data.recipient = recipient;
    }

    if (matchedDonationDoc) {
      const storagePreference = matchedDonationDoc.details.storageType;
      const bags = extractCollection(matchedDonationDoc.details.bags);

      data.matchedDonation = {
        id: matchedDonationDoc.id,
        donor: extractID(matchedDonationDoc.donor),
        storageType: storagePreference,
        bags: bags.map((bag) => extractMilkBagSchema(bag) as MilkBagSchema),
      };

      if (preferences?.length) {
        const nearestPref = getNearestDeliveryPreference(extractCollection(preferences));
        const prefID = extractID(nearestPref?.deliveryPreference);
        data.deliveryPreferences = prefID ? [prefID] : data.deliveryPreferences;
      }

      data.details.storagePreference = storagePreference;
    }

    if (!isEqual(data, getValues())) {
      reset(data);
    }
  }, [preferences, matchedDonationDoc, reset, recipient, formData, getValues]);

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

  return { form, ...restOfQuery };
};

function getStoredData({ user, recipient, matchedDonation }: Params): RequestSchema | undefined {
  if (!user) return undefined;
  const profile = extractCollection(user.profile?.value);

  const id = user.id;
  const storageKey = `${storageKeyPrefix}-${id}`;
  const raw = requestStorage.getString(storageKey);

  const storedData: DeepPartial<RequestSchema> | undefined = raw && JSON.parse(raw);
  const requester = profile?.id;

  return {
    requester: storedData?.requester || requester,
    volumeNeeded: storedData?.volumeNeeded || 20,
    deliveryPreferences: storedData?.deliveryPreferences || [],
    recipient: storedData?.recipient || recipient,
    matchedDonation:
      storedData?.matchedDonation || (matchedDonation ? { id: matchedDonation } : undefined),
    details: {
      ...storedData?.details,
      bags: storedData?.details?.bags || [],
      reason: storedData?.details?.reason || '',
      notes: storedData?.details?.notes || '',
      storagePreference: storedData?.details?.storagePreference || 'EITHER',
    },
  } as RequestSchema;
}
