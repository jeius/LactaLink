import { donationStorage } from '@/lib/localStorage';
import { zodResolver } from '@hookform/resolvers/zod';
import { MilkBag, User } from '@lactalink/types/payload-generated-types';
import { createStorageKeyByUser } from '@lactalink/utilities';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';

import { segregateMilkBags } from '@/lib/utils/segregateMilkBags';
import { MILK_BAG_STATUS } from '@lactalink/enums';
import { DonationSchema, donationSchema } from '@lactalink/form-schemas';

import { transformToMilkBagShema } from '@/lib/utils/transformData';
import { randomUUID } from 'expo-crypto';
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
      debounce((value: DeepPartial<DonationSchema>) => {
        donationStorage.set(storageKey, JSON.stringify(value));
      }, 500),
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
  }, [bagsQuery.isSuccess, draftMilkBags, getValues, matchedRequest, reset]);

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
  const segregatedBags = segregateMilkBags(draftMilkBags);

  const newDetailsBags: DonationSchema['details']['bags'] = [];
  const newMilkBags: DonationSchema['milkBags'] = {};

  for (const bags of Object.values(segregatedBags)) {
    if (bags.length === 0) continue;

    const groupID = randomUUID();

    newDetailsBags.push({
      donor: extractID(bags[0]!.donor),
      volume: bags[0]!.volume,
      quantity: bags.length,
      collectedAt: bags[0]!.collectedAt,
      groupID,
    });

    newMilkBags[groupID] = bags.map((bag) => transformToMilkBagShema(bag));
  }
  return { newDetailsBags, newMilkBags };
}

function getData(user: User | null, storageKey: string): DonationSchema | undefined {
  const profile = extractCollection(user?.profile?.value);
  const storedData = getStoredData(user, storageKey);
  const donor = profile?.id;
  return {
    milkBags: storedData?.milkBags || {},
    donor: storedData?.donor || donor,
    deliveryPreferences: storedData?.deliveryPreferences || [],
    details: {
      ...storedData?.details,
      notes: storedData?.details?.notes || '',
      bags: storedData?.details?.bags || [
        {
          donor,
          volume: 20,
          quantity: 1,
          collectedAt: new Date().toISOString(),
          groupID: randomUUID(),
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
