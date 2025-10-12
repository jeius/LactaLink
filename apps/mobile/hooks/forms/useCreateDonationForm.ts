import { zodResolver } from '@hookform/resolvers/zod';
import { MilkBag, User } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';

import { MILK_BAG_STATUS } from '@lactalink/enums';
import { CreateMilkBagSchema, DonationSchema, donationSchema } from '@lactalink/form-schemas';

import { getSavedFormData, saveFormData } from '@/lib/localStorage/utils';
import {
  transformToDeliveryPreferenceSchema,
  transformToMilkBagShema,
} from '@/lib/utils/transformData';

import { FormProps } from '@/components/contexts/FormProvider';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import { useEffect, useMemo } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';
import { useMeUser } from '../auth/useAuth';
import { useFetchBySlug } from '../collections/useFetchBySlug';

const debouncedSave = debounce((value) => saveFormData('donation-create', value), 200);

type Params = {
  matchedRequest?: string;
  recipient?: { value: string; relationTo: NonNullable<User['profile']>['relationTo'] };
};

export function useCreateDonationForm({
  matchedRequest,
  recipient,
}: Params): Omit<FormProps<DonationSchema>, 'children'> {
  const { data: user, ...userQuery } = useMeUser();
  const profile = extractCollection(user?.profile?.value);
  const preferences = useMemo(() => user?.deliveryPreferences?.docs || [], [user]);

  // #region Queries
  const { data: draftMilkBags = [], ...bagsQuery } = useFetchBySlug(
    Boolean(profile),
    {
      collection: 'milkBags',
      where: {
        and: [
          { status: { equals: MILK_BAG_STATUS.DRAFT.value } },
          { donor: { equals: extractID(profile) } },
        ],
      },
      sort: 'createdAt',
    },
    { refetchOnMount: 'always', refetchOnReconnect: 'always' }
  );
  // #endregion
  // #region Form Setup
  const form = useForm({
    resolver: zodResolver(donationSchema),
    mode: 'onTouched',
    defaultValues: createDefaultValues(user),
  });

  const { reset, getValues, watch, formState } = form;
  const isSubmitSuccessful = formState.isSubmitSuccessful;

  // #endregion
  // #region Use Effects
  // When draft milk bags exist, update the form values.
  useEffect(() => {
    if (matchedRequest || !draftMilkBags.length || !bagsQuery.isSuccess) {
      return;
    }

    const { newDetailsBags, newMilkBags } = updateDataOnDraftBagsExist(draftMilkBags);

    const data = getValues();
    data.details.bags = newDetailsBags;
    data.milkBags = newMilkBags;
    reset(data);
  }, [bagsQuery.isSuccess, draftMilkBags, getValues, matchedRequest, reset]);

  // When user preferences or recipient prop changes, update the form values.
  useEffect(() => {
    const data = getValues();

    if (!matchedRequest) {
      data.matchedRequest = undefined;
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
  }, [preferences, getValues, reset, recipient, matchedRequest]);

  // Watch form changes and save to local storage (debounced).
  useEffect(() => {
    const subscription = watch(debouncedSave);

    return () => {
      subscription.unsubscribe();
      debouncedSave.cancel();
    };
  }, [watch]);

  // When the form is successfully submitted, save preferred values to local storage and clear old data.
  useEffect(() => {
    if (isSubmitSuccessful) {
      const data = getValues();

      const preferredValues: DeepPartial<DonationSchema> = {
        details: {
          notes: data.details.notes,
          collectionMode: data.details.collectionMode,
          storageType: data.details.storageType,
        },
        deliveryPreferences: matchedRequest ? [] : data.deliveryPreferences,
      };

      // Save the preffered values to local storage
      debouncedSave(preferredValues);
    }
  }, [isSubmitSuccessful, getValues, matchedRequest]);
  // #endregion
  return {
    ...form,
    isLoading: bagsQuery.isLoading || userQuery.isLoading,
    isFetching: bagsQuery.isFetching || userQuery.isFetching,
    fetchError: bagsQuery.error || userQuery.error,
    refreshing: bagsQuery.isRefetching || userQuery.isRefetching,
    onRefresh: () => {
      bagsQuery.refetch();
      userQuery.refetch();
    },
  };
}

// #region Helper Functions
function updateDataOnDraftBagsExist(draftMilkBags: MilkBag[]) {
  const newDetailsBags: CreateMilkBagSchema[] = [];

  const newMilkBags: DonationSchema['milkBags'] = [];

  for (const bag of draftMilkBags) {
    newMilkBags.push(transformToMilkBagShema(bag));
    newDetailsBags.push({
      id: bag.id,
      donor: extractID(bag.donor),
      volume: bag.volume,
      collectedAt: bag.collectedAt,
    });
  }

  return { newDetailsBags, newMilkBags };
}

function createDefaultValues(user: User | null): DonationSchema | undefined {
  const profile = extractCollection(user?.profile?.value);
  const savedData = getSavedFormData('donation-create');

  if (savedData) return savedData as DonationSchema;

  if (!user || !profile) return;

  const donorID = extractID(profile);

  return {
    milkBags: [],
    deliveryPreferences: [],
    donor: donorID,
    details: {
      notes: '',
      bags: [
        {
          donor: donorID,
          volume: 0,
          collectedAt: new Date().toISOString(),
        },
      ],
    } as DonationSchema['details'],
  };
}
// #endregion
