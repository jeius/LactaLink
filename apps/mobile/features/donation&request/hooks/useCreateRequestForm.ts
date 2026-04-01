import { RequestCreateSchema, requestCreateSchema } from '@lactalink/form-schemas';

import { Donation, User } from '@lactalink/types/payload-generated-types';

import { FormProps, useForm } from '@/components/contexts/FormProvider';
import { useDonation } from '@/features/donation&request/hooks/queries';
import { deleteSavedFormData, saveFormData } from '@/lib/localStorage/utils';
import {
  transformToDeliveryPreferenceSchema,
  transformToDonationSchema,
} from '@/lib/utils/transformData';
import { zodResolver } from '@hookform/resolvers/zod';
import { UseQueryResult } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { useMeUser } from '../../../hooks/auth/useAuth';
import { getPreferredRequestValues, getRequestDefaultValues } from '../lib/formUtils';

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

  const isMatched = Boolean(matchedDonation);
  const hasRecipient = Boolean(recipient);

  const donationQuery = useDonation(matchedDonation);
  const { data: matchedDonationDoc } = donationQuery;

  const methods = useHookForm<RequestCreateSchema>({
    resolver: zodResolver(requestCreateSchema),
    mode: 'onTouched',
    reValidateMode: 'onBlur',
    defaultValues: getRequestDefaultValues(user, { isMatched, hasRecipient }),
  });

  const { getValues, formState, setValue } = methods;
  const isSubmitSuccessful = formState.isSubmitSuccessful;

  const handleRefresh = useCallback(() => {
    if (matchedDonation) donationQuery.refetch();
  }, [donationQuery, matchedDonation]);

  const handleMatchedWithDonation = useCallback(
    (doc: Donation) => {
      const transformed = transformToDonationSchema(doc);
      setValue('type', 'MATCHED');
      setValue('matchedDonation', transformed);
      const storage = transformed.details.storageType;
      // If the storage preference is EITHER, we want to leave it up to the donor
      // Otherwise, we set it to the request's preference since the donor has no say in the matter
      setValue('details.storagePreference', storage);
    },
    [setValue]
  );

  const handleDirectRequest = useCallback(
    (receiver: NonNullable<typeof recipient>) => {
      setValue('type', 'DIRECT');
      setValue('recipient', receiver);
    },
    [setValue]
  );

  useEffect(() => {
    if (isMatched && matchedDonationDoc) {
      handleMatchedWithDonation(matchedDonationDoc);
    } else if (hasRecipient && recipient) {
      handleDirectRequest(recipient);
    } else {
      const defaultPreferences = getValues('deliveryPreferences') || [];
      if (defaultPreferences.length > 0) return;
      setValue(
        'deliveryPreferences',
        preferences
          .map((pref) => transformToDeliveryPreferenceSchema(pref))
          .filter((v) => v !== null)
      );
    }
  }, [
    getValues,
    handleDirectRequest,
    handleMatchedWithDonation,
    hasRecipient,
    isMatched,
    matchedDonationDoc,
    preferences,
    recipient,
    setValue,
  ]);

  useEffect(() => {
    if (isSubmitSuccessful) {
      if (isMatched || hasRecipient) {
        deleteSavedFormData('request-create');
        return;
      }

      const data = getValues();
      const preferredValues = getPreferredRequestValues(data);

      // Save the preffered values to local storage
      saveFormData('request-create', preferredValues);
    }
  }, [getValues, hasRecipient, isMatched, isSubmitSuccessful]);

  return {
    ...methods,
    isLoading: donationQuery.isLoading,
    isFetching: donationQuery.isFetching,
    refreshing: donationQuery.isRefetching,
    fetchError: userQuery.error || donationQuery.error,
    onRefresh: handleRefresh,
    extraData: {
      isMatched,
      hasRecipient,
      donationQuery: donationQuery,
    },
  };
}

export function useRequestFormExtraData() {
  const { additionalState } = useForm<RequestCreateSchema>();
  return additionalState.extraData as {
    isMatched: boolean;
    hasRecipient: boolean;
    donationQuery: UseQueryResult<Donation, Error>;
  };
}
