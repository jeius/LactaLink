import { donationStorage } from '@/lib/localStorage';
import { zodResolver } from '@hookform/resolvers/zod';
import { MilkBag, User } from '@lactalink/types/payload-generated-types';
import { createStorageKeyByUser } from '@lactalink/utilities';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';

import { MILK_BAG_STATUS } from '@lactalink/enums';
import { CreateMilkBagSchema, DonationSchema, donationSchema } from '@lactalink/form-schemas';

import { transformToMilkBagShema } from '@/lib/utils/transformData';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import { useEffect, useMemo } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';
import { useFetchBySlug } from '../collections/useFetchBySlug';

const BASE_STORAGE_KEY = 'create-donation-form';

type Params = {
  matchedRequest?: string;
  user: User | null;
  recipient?: { value: string; relationTo: NonNullable<User['profile']>['relationTo'] };
};

export const useCreateDonationForm = ({ matchedRequest, user, recipient }: Params) => {
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

  const isLoading = bagsQuery.isLoading;
  const isFetching = bagsQuery.isFetching;
  const isRefetching = bagsQuery.isRefetching;
  const error = bagsQuery.error;
  // #endregion

  // #region Form Setup
  const storageKey = useMemo(() => createStorageKeyByUser(user, BASE_STORAGE_KEY), [user]);

  const form = useForm({
    resolver: zodResolver(donationSchema),
    mode: 'onTouched',
    defaultValues: getData(user, storageKey),
  });

  const isSubmitSuccessful = form.formState.isSubmitSuccessful;
  const getValues = form.getValues;
  const reset = form.reset;

  const debouncedSave = useMemo(
    () =>
      debounce(
        (value: DeepPartial<DonationSchema>) => {
          donationStorage.set(storageKey, JSON.stringify(value));
        },
        500,
        { leading: true }
      ),
    [storageKey]
  );
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
  }, [bagsQuery.isSuccess, draftMilkBags, getValues, matchedRequest, reset, isRefetching]);

  // When user preferences or recipient prop changes, update the form values.
  useEffect(() => {
    const data = getValues();

    if (!matchedRequest) {
      data.matchedRequest = undefined;
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
  }, [preferences, getValues, reset, recipient, matchedRequest]);

  // Watch form changes and save to local storage (debounced).
  useEffect(() => {
    const subscription = form.watch((data) => {
      debouncedSave(data);
    });

    return () => {
      subscription.unsubscribe();
      debouncedSave.cancel();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  }, [isSubmitSuccessful, getValues, storageKey, debouncedSave, matchedRequest]);
  // #endregion

  // #region Form Methods
  function handleRefetch() {
    bagsQuery.refetch();
  }
  // #endregion

  return { form, isLoading, isFetching, error, isRefetching, refetch: handleRefetch };
};

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

function getData(user: User | null, storageKey: string): DonationSchema | undefined {
  const profile = extractCollection(user?.profile?.value);
  const donorID = extractID(profile);
  const storedData = getStoredData(user, storageKey);
  return {
    milkBags: storedData?.milkBags || {},
    donor: storedData?.donor || donorID,
    deliveryPreferences: storedData?.deliveryPreferences || [],
    details: {
      ...storedData?.details,
      notes: storedData?.details?.notes || '',
      bags: storedData?.details?.bags || [
        {
          donor: donorID,
          volume: 20,
          collectedAt: new Date().toISOString(),
        },
      ],
    },
  } as DonationSchema;
}

function getStoredData(
  user: User | null,
  storageKey: string
): DeepPartial<DonationSchema> | undefined {
  if (!user) return undefined;
  const raw = donationStorage.getString(storageKey);
  return raw && JSON.parse(raw);
}
// #endregion
