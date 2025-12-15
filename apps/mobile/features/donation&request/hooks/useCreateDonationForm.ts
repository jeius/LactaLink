import { zodResolver } from '@hookform/resolvers/zod';

import {
  DonationCreateSchema,
  donationCreateSchema,
  MilkBagCreateSchema,
  MilkBagSchema,
} from '@lactalink/form-schemas';
import { MilkBag, Request, User } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';

import { getSavedFormData, saveFormData } from '@/lib/localStorage/utils';
import {
  transformToDeliveryPreferenceSchema,
  transformToMilkBagCreateSchema,
  transformToMilkBagSchema,
  transformToRequestSchema,
} from '@/lib/utils/transformData';

import { FormProps } from '@/components/contexts/FormProvider';
import { useDraftMilkbags, useRequest } from '@/features/donation&request/hooks/queries';
import { useMeUser } from '@/hooks/auth/useAuth';

import isEqual from 'lodash/isEqual';
import { useEffect, useMemo } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';

export type DonationCreateFormExtraData = {
  milkBags: MilkBag[] | undefined;
  matchedRequest: Request | undefined;
};

type Params = {
  matchedRequest: string | undefined;
  recipient?: { value: string; relationTo: NonNullable<User['profile']>['relationTo'] };
};

export function useCreateDonationForm({
  matchedRequest,
  recipient,
}: Params): Omit<FormProps<DonationCreateSchema>, 'children'> {
  const { data: user = null, ...userQuery } = useMeUser();
  const preferences = useMemo(() => user?.deliveryPreferences?.docs || [], [user]);

  // #region Queries
  const { data: draftMilkBags, ...bagsQuery } = useDraftMilkbags();
  const { data: matchedRequestDoc, ...requestQuery } = useRequest(matchedRequest);
  // #endregion

  // #region Form Setup
  const form = useForm<DonationCreateSchema>({
    resolver: zodResolver(donationCreateSchema),
    mode: 'onTouched',
    defaultValues: createDefaultValues(user, !!matchedRequest, !!recipient),
  });

  const { reset, getValues, formState } = form;
  const isSubmitSuccessful = formState.isSubmitSuccessful;
  // #endregion

  // #region Use Effects
  // When draft milk bags exist, update the form values.
  useEffect(() => {
    if (!draftMilkBags) return;

    const { newDetailsBags, newMilkBags } = updateDataOnDraftBagsExist(draftMilkBags);

    const newValues = getValues();
    newValues.details.bags = newDetailsBags;
    newValues.milkBags = newMilkBags;

    if (!isEqual(newValues, getValues())) {
      reset(newValues);
    }
  }, [draftMilkBags, getValues, reset]);

  // When matched request and recipient prop changes, update the form values.
  useEffect(() => {
    const defaults = getValues();

    if (matchedRequestDoc) {
      const transformedRequest = transformToRequestSchema(matchedRequestDoc);
      const preferredStorage = transformedRequest.details.storagePreference;
      reset({
        ...defaults,
        type: 'MATCHED',
        matchedRequest: transformedRequest,
        details: {
          ...defaults.details,
          storageType: preferredStorage === 'EITHER' ? undefined : preferredStorage,
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
  }, [getValues, matchedRequestDoc, preferences, recipient, reset]);

  // When the form is successfully submitted, save preferred values to local storage and clear old data.
  useEffect(() => {
    if (isSubmitSuccessful && !matchedRequest && !recipient) {
      const data = getValues();

      const preferredValues: DeepPartial<typeof data> = {
        details: {
          notes: data.details.notes,
          collectionMode: data.details.collectionMode,
          storageType: data.details.storageType,
        },
        deliveryPreferences: data.deliveryPreferences,
      };

      // Save the preffered values to local storage
      saveFormData('donation-create', preferredValues);
    }
  }, [isSubmitSuccessful, getValues, matchedRequest, recipient]);
  // #endregion

  return {
    ...form,
    isLoading: bagsQuery.isLoading || userQuery.isLoading || requestQuery.isLoading,
    isFetching: bagsQuery.isFetching || userQuery.isFetching || requestQuery.isFetching,
    fetchError: bagsQuery.error || userQuery.error || requestQuery.error,
    refreshing: bagsQuery.isRefetching || userQuery.isRefetching || requestQuery.isRefetching,
    onRefresh: () => {
      bagsQuery.refetch();
      userQuery.refetch();
      requestQuery.refetch();
    },
    extraData: {
      milkBags: draftMilkBags,
      matchedRequest: matchedRequestDoc,
    } as DonationCreateFormExtraData,
  };
}

// #region Helper Functions
function updateDataOnDraftBagsExist(draftMilkBags: MilkBag[]) {
  const newDetailsBags: MilkBagCreateSchema[] = [];

  const newMilkBags: MilkBagSchema[] = [];

  for (const bag of draftMilkBags) {
    newMilkBags.push(transformToMilkBagSchema(bag));
    newDetailsBags.push(transformToMilkBagCreateSchema(bag));
  }

  return { newDetailsBags, newMilkBags };
}

function createDefaultValues(
  user: User | null,
  isMatched: boolean,
  hasRecipient: boolean
): DonationCreateSchema | undefined {
  const profile = extractCollection(user?.profile?.value);
  const savedData = getSavedFormData('donation-create') as DonationCreateSchema | undefined;

  if (savedData && !isMatched && !hasRecipient) return savedData;

  if (!user || !profile) return;

  const donorID = extractID(profile);

  return {
    type: 'OPEN',
    milkBags: [],
    deliveryPreferences: [],
    donor: donorID,
    details: {
      notes: '',
      bags: [] as MilkBagCreateSchema[],
    } as DonationCreateSchema['details'],
  };
}
// #endregion
