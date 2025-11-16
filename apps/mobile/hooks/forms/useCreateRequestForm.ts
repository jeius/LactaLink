import { RequestCreateSchema, requestCreateSchema, RequestSchema } from '@lactalink/form-schemas';

import { Donation, User } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';

import { FormProps } from '@/components/contexts/FormProvider';
import { getSavedFormData, saveFormData } from '@/lib/localStorage/utils';
import {
  transformToDeliveryPreferenceSchema,
  transformToDonationSchema,
} from '@/lib/utils/transformData';
import { zodResolver } from '@hookform/resolvers/zod';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import { useEffect, useMemo } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';
import { useMeUser } from '../auth/useAuth';
import { useFetchById } from '../collections/useFetchById';

export type RequestCreateFormExtraData = {
  matchedDonation: Donation | undefined;
};

type Params = {
  recipient?: { value: string; relationTo: NonNullable<User['profile']>['relationTo'] };
  matchedDonation: string | undefined;
};

export function useCreateRequestForm({
  matchedDonation,
  recipient,
}: Params): Omit<FormProps<RequestCreateSchema>, 'children'> {
  const { data: user, ...userQuery } = useMeUser();
  const preferences = useMemo(() => user?.deliveryPreferences?.docs || [], [user]);

  const { data: matchedDonationDoc, ...donationQuery } = useFetchById(!!matchedDonation, {
    collection: 'donations',
    id: matchedDonation || '',
  });

  const debouncedSave = useMemo(
    () =>
      debounce((value) => {
        if (matchedDonation) return;
        saveFormData('request-create', value);
      }, 200),
    [matchedDonation]
  );

  const form = useForm<RequestCreateSchema>({
    resolver: zodResolver(requestCreateSchema),
    mode: 'onTouched',
    defaultValues: createDefaultValues(user, !!matchedDonation, !!recipient),
  });

  const { reset, getValues, watch, formState } = form;
  const isSubmitSuccessful = formState.isSubmitSuccessful;

  // When matched request and recipient prop changes, update the form values.
  useEffect(() => {
    const defaults = getValues();

    if (matchedDonationDoc) {
      const transformedDonation = transformToDonationSchema(matchedDonationDoc);
      const preferredStorage = transformedDonation.details.storageType;
      reset({
        ...defaults,
        type: 'MATCHED',
        matchedDonation: transformedDonation,
        details: {
          ...defaults.details,
          bags: [],
          storagePreference: preferredStorage,
        },
      });
    } else if (recipient) {
      reset({ ...defaults, type: 'DIRECT', recipient });
    } else {
      if (!defaults.deliveryPreferences?.length) {
        defaults.deliveryPreferences = preferences
          .map((pref) => transformToDeliveryPreferenceSchema(pref))
          .filter((v) => v !== null);
      }

      if (!isEqual(defaults, getValues())) {
        reset({ ...defaults, type: 'OPEN' });
      }
    }
  }, [getValues, matchedDonationDoc, preferences, recipient, reset]);

  // Watch form changes and save to local storage (debounced).
  useEffect(() => {
    const subscription = watch(debouncedSave);
    return () => {
      subscription.unsubscribe();
      debouncedSave.cancel();
    };
  }, [debouncedSave, watch]);

  /**
   * When the form is successfully submitted
   * save the user preference to local storage.
   */
  useEffect(() => {
    async function saveUserPreference() {
      if (isSubmitSuccessful && !matchedDonation) {
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
  }, [debouncedSave, getValues, isSubmitSuccessful, matchedDonation]);

  return {
    ...form,
    isLoading: userQuery.isLoading || donationQuery.isLoading,
    isFetching: userQuery.isFetching || donationQuery.isFetching,
    refreshing: userQuery.isRefetching || donationQuery.isRefetching,
    fetchError: userQuery.error || donationQuery.error,
    extraData: { matchedDonation: matchedDonationDoc } as RequestCreateFormExtraData,
    onRefresh() {
      userQuery.refetch();
      donationQuery.refetch();
    },
  };
}

function createDefaultValues(
  user: User | null,
  isMatched: boolean,
  hasRecipient: boolean
): RequestCreateSchema | undefined {
  const profile = extractCollection(user?.profile?.value);
  const savedData = getSavedFormData('request-create');

  if (savedData && !isMatched && !hasRecipient) return savedData as RequestCreateSchema;

  if (!profile) return;

  const requester = profile.id;

  return {
    type: 'OPEN',
    requester: requester,
    volumeNeeded: 20,
    deliveryPreferences: [],
    details: {
      reason: '',
      notes: '',
    } as RequestCreateSchema['details'],
  };
}
