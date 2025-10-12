import { requestSchema, RequestSchema } from '@lactalink/form-schemas';

import { User } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';

import { FormProps } from '@/components/contexts/FormProvider';
import { getSavedFormData, saveFormData } from '@/lib/localStorage/utils';
import { transformToDeliveryPreferenceSchema } from '@/lib/utils/transformData';
import { zodResolver } from '@hookform/resolvers/zod';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import { useEffect, useMemo } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';
import { useMeUser } from '../auth/useAuth';

const debouncedSave = debounce((value) => saveFormData('request-create', value), 200);

type Params = {
  recipient?: { value: string; relationTo: NonNullable<User['profile']>['relationTo'] };
  matchedDonation?: string;
};

export function useCreateRequestForm({
  matchedDonation,
  recipient,
}: Params): Omit<FormProps<RequestSchema>, 'children'> {
  const { data: user, ...userQuery } = useMeUser();
  const preferences = useMemo(() => user?.deliveryPreferences?.docs || [], [user]);

  const form = useForm({
    resolver: zodResolver(requestSchema),
    mode: 'onTouched',
    defaultValues: createDefaultValues(user),
  });

  const { reset, getValues, watch, formState } = form;
  const isSubmitSuccessful = formState.isSubmitSuccessful;

  useEffect(() => {
    const data = getValues();

    if (!matchedDonation) {
      data.matchedDonation = undefined;
    } else {
      data.volumeNeeded = 0;
    }

    if (preferences?.length && !data.deliveryPreferences?.length) {
      data.deliveryPreferences = preferences
        .map((doc) => {
          const pref = extractCollection(doc);
          if (!pref) return null;
          return transformToDeliveryPreferenceSchema(pref);
        })
        .filter((v) => v !== null);
    }

    data.recipient = recipient;

    if (!isEqual(data, getValues())) {
      reset(data);
    }
  }, [getValues, matchedDonation, preferences, recipient, reset]);

  // Watch form changes and save to local storage (debounced).
  useEffect(() => {
    const subscription = watch((value) => {
      debouncedSave(value);
    });

    return () => {
      subscription.unsubscribe();
      debouncedSave.cancel();
    };
  }, [watch]);

  /**
   * When the form is successfully submitted
   * save the user preference to local storage.
   */
  useEffect(() => {
    async function saveUserPreference() {
      if (isSubmitSuccessful) {
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
  }, [getValues, isSubmitSuccessful]);

  return {
    ...form,
    isLoading: userQuery.isLoading,
    isFetching: userQuery.isFetching,
    refreshing: userQuery.isRefetching,
    onRefresh: userQuery.refetch,
    fetchError: userQuery.error,
  };
}

function createDefaultValues(user: User | null): RequestSchema | undefined {
  const profile = extractCollection(user?.profile?.value);
  const savedData = getSavedFormData('request-create');

  if (savedData) return savedData as RequestSchema;

  if (!profile) return;

  const requester = profile.id;

  return {
    requester: requester,
    volumeNeeded: 20,
    deliveryPreferences: [],
    details: {
      bags: [] as RequestSchema['details']['bags'],
      reason: '',
      notes: '',
    } as RequestSchema['details'],
  };
}
