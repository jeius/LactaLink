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
  matchedDonation?: string;
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
        if (matchedDonation) {
          saveFormData('request-create', { ...value, deliveryPreferences: [] });
        } else {
          saveFormData('request-create', value);
        }
      }, 200),
    [matchedDonation]
  );

  const form = useForm<RequestCreateSchema>({
    resolver: zodResolver(requestCreateSchema),
    mode: 'onTouched',
    defaultValues: createDefaultValues(user),
  });

  const { reset, getValues, watch, formState } = form;
  const isSubmitSuccessful = formState.isSubmitSuccessful;

  useEffect(() => {
    const transformedDonation = transformToDonationSchema(matchedDonationDoc);
    reset({ ...getValues(), matchedDonation: transformedDonation });
  }, [getValues, matchedDonationDoc, reset]);

  // When user preferences or recipient prop changes, update the form values.
  useEffect(() => {
    const newValues = getValues();

    if (!newValues.deliveryPreferences?.length) {
      newValues.deliveryPreferences = preferences
        .map((pref) => transformToDeliveryPreferenceSchema(pref))
        .filter((v) => v !== null);
    }

    newValues.recipient = recipient;

    if (!isEqual(newValues, getValues())) {
      reset(newValues);
    }
  }, [preferences, getValues, reset, recipient]);

  // Watch form changes and save to local storage (debounced).
  useEffect(() => {
    const subscription = watch((value) => {
      debouncedSave(value);
    });

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
  }, [debouncedSave, getValues, isSubmitSuccessful]);

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

function createDefaultValues(user: User | null): RequestCreateSchema | undefined {
  const profile = extractCollection(user?.profile?.value);
  const savedData = getSavedFormData('request-create');

  if (savedData) return savedData as RequestCreateSchema;

  if (!profile) return;

  const requester = profile.id;

  return {
    requester: requester,
    volumeNeeded: 20,
    deliveryPreferences: [],
    details: {
      bags: [] as RequestCreateSchema['details']['bags'],
      reason: '',
      notes: '',
    } as RequestCreateSchema['details'],
  };
}
