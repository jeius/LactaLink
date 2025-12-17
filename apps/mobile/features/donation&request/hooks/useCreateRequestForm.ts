import { RequestCreateSchema, requestCreateSchema, RequestSchema } from '@lactalink/form-schemas';

import { User } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';

import { FormProps } from '@/components/contexts/FormProvider';
import { useDonation } from '@/features/donation&request/hooks/queries';
import { getSavedFormData, saveFormData } from '@/lib/localStorage/utils';
import {
  transformToDeliveryPreferenceSchema,
  transformToDonationSchema,
} from '@/lib/utils/transformData';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';
import { useMeUser } from '../../../hooks/auth/useAuth';

type Params = {
  recipient?: { value: string; relationTo: NonNullable<User['profile']>['relationTo'] };
  matchedDonation: string | undefined;
};

export function useCreateRequestForm({
  matchedDonation,
  recipient,
}: Params): Omit<FormProps<RequestCreateSchema>, 'children'> {
  const { data: user = null, ...userQuery } = useMeUser();
  const preferences = useMemo(() => user?.deliveryPreferences?.docs || [], [user]);

  const { data: matchedDonationDoc, ...donationQuery } = useDonation(matchedDonation);

  const methods = useForm<RequestCreateSchema>({
    resolver: zodResolver(requestCreateSchema),
    mode: 'onTouched',
    defaultValues: createDefaultValues(user, !!matchedDonation, !!recipient),
  });

  const { getValues, formState, setValue } = methods;
  const isSubmitSuccessful = formState.isSubmitSuccessful;

  // When matched request and recipient prop changes, update the form values.
  useEffect(() => {
    if (matchedDonationDoc) {
      const transformedDonation = transformToDonationSchema(matchedDonationDoc);
      const preferredStorage = transformedDonation.details.storageType;
      setValue('type', 'MATCHED');
      setValue('matchedDonation', transformedDonation);
      setValue('details.bags', []);
      setValue('details.storagePreference', preferredStorage);
    } else if (recipient) {
      setValue('type', 'DIRECT');
      setValue('recipient', recipient);
    } else {
      if (!getValues('deliveryPreferences')?.length) {
        const defaultPrefs = preferences
          .map((pref) => transformToDeliveryPreferenceSchema(pref))
          .filter((v) => v !== null);
        setValue('deliveryPreferences', defaultPrefs);
      }
    }
  }, [getValues, matchedDonationDoc, preferences, recipient, setValue]);

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
        saveFormData('request-create', preferredValues);
      }
    }

    saveUserPreference();
  }, [getValues, isSubmitSuccessful, matchedDonation]);

  return {
    ...methods,
    isLoading: userQuery.isLoading,
    isFetching: userQuery.isFetching,
    refreshing: userQuery.isRefetching,
    fetchError: userQuery.error || donationQuery.error,
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
