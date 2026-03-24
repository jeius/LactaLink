import { zodResolver } from '@hookform/resolvers/zod';

import { DonationCreateSchema, donationCreateSchema } from '@lactalink/form-schemas';

import {
  transformToDeliveryPreferenceSchema,
  transformToRequestSchema,
} from '@/lib/utils/transformData';

import { FormProps, useForm } from '@/components/contexts/FormProvider';
import { useDraftMilkbags, useRequest } from '@/features/donation&request/hooks/queries';
import { useMeUser } from '@/hooks/auth/useAuth';

import { deleteSavedFormData, saveFormData } from '@/lib/localStorage/utils';
import { UserProfile } from '@lactalink/types';
import { Request } from '@lactalink/types/payload-generated-types';
import { UseQueryResult } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import {
  getDonationDefaultValues,
  getPreferredDonationValues,
  transformDraftBags,
} from '../lib/formUtils';

type Params = {
  matchedRequest: string | undefined;
  recipient?: { value: string; relationTo: UserProfile['relationTo'] };
};

export function useCreateDonationForm({
  matchedRequest,
  recipient,
}: Params): Omit<FormProps<DonationCreateSchema>, 'children'> {
  const { data: user = null, ...userQuery } = useMeUser();
  const preferences = useMemo(() => user?.deliveryPreferences?.docs || [], [user]);

  const isMatched = Boolean(matchedRequest);
  const hasRecipient = Boolean(recipient);

  // #region Queries
  const { data: draftMilkBags, ...bagsQuery } = useDraftMilkbags();
  const { data: matchedRequestDoc, ...requestQuery } = useRequest(matchedRequest);

  const handleRefresh = useCallback(() => {
    bagsQuery.refetch();
    if (matchedRequest) requestQuery.refetch();
  }, [bagsQuery, requestQuery, matchedRequest]);
  // #endregion

  // #region Form Setup
  const form = useHookForm<DonationCreateSchema>({
    resolver: zodResolver(donationCreateSchema),
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    defaultValues: getDonationDefaultValues(user, { isMatched, hasRecipient }),
  });

  const {
    getValues,
    setValue,
    formState: { isSubmitSuccessful },
  } = form;
  // #endregion

  const handleMatchedWithRequest = useCallback(
    (request: Request) => {
      const transformedRequest = transformToRequestSchema(request);
      setValue('type', 'MATCHED');
      setValue('matchedRequest', transformedRequest);
      const storage = transformedRequest.details.storagePreference;
      // If the storage preference is EITHER, we want to leave it up to the donor
      // Otherwise, we set it to the request's preference since the donor has no say in the matter
      if (storage !== 'EITHER') setValue('details.storageType', storage);
    },
    [setValue]
  );

  const handleDirectDonation = useCallback(
    (receiver: NonNullable<typeof recipient>) => {
      setValue('type', 'DIRECT');
      setValue('recipient', receiver);
    },
    [setValue]
  );

  // #region Use Effects
  useEffect(() => {
    if (!draftMilkBags) return;
    setValue('details.bags', transformDraftBags(draftMilkBags));
  }, [draftMilkBags, setValue]);

  useEffect(() => {
    if (isMatched && matchedRequestDoc) {
      handleMatchedWithRequest(matchedRequestDoc);
    } else if (hasRecipient && recipient) {
      handleDirectDonation(recipient);
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
    handleDirectDonation,
    handleMatchedWithRequest,
    hasRecipient,
    isMatched,
    matchedRequestDoc,
    preferences,
    recipient,
    setValue,
  ]);

  useEffect(() => {
    if (isSubmitSuccessful) {
      if (isMatched || hasRecipient) {
        deleteSavedFormData('donation-create');
        return;
      }
      const data = getValues();
      const preferredValues = getPreferredDonationValues(data);
      // Save the preffered values to local storage
      saveFormData('donation-create', preferredValues);
    }
  }, [getValues, hasRecipient, isMatched, isSubmitSuccessful]);

  // #endregion

  const requestExtraData = { data: matchedRequestDoc, ...requestQuery } as UseQueryResult<
    Request,
    Error
  >;

  return {
    ...form,
    isLoading: bagsQuery.isLoading,
    isFetching: bagsQuery.isFetching,
    fetchError: bagsQuery.error || userQuery.error,
    refreshing: bagsQuery.isRefetching,
    onRefresh: handleRefresh,
    extraData: {
      isMatched,
      hasRecipient,
      requestQuery: requestExtraData,
    },
  };
}

export function useDonationFormExtraData() {
  const { additionalState } = useForm<DonationCreateSchema>();
  return additionalState.extraData as {
    isMatched: boolean;
    hasRecipient: boolean;
    requestQuery: UseQueryResult<Request, Error>;
  };
}
