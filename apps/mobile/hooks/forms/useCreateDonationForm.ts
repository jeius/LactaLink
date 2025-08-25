import { donationStorage } from '@/lib/localStorage';
import { zodResolver } from '@hookform/resolvers/zod';
import { DonationSchema, donationSchema, Request, User } from '@lactalink/types';

import { MILK_BAG_STATUS } from '@/lib/constants';
import { extractImageSchema } from '@/lib/utils/extractImageSchema';
import { segregateMilkBags } from '@/lib/utils/segregateMilkBags';
import { extractCollection, extractID } from '@lactalink/utilities';
import { randomUUID } from 'expo-crypto';
import { debounce } from 'lodash';
import { useEffect, useMemo } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';
import { useFetchById } from '../collections/useFetchById';
import { useFetchBySlug } from '../collections/useFetchBySlug';

const storageKeyPrefix = 'donation-form';

type Params = {
  matchedRequest?: string;
  user: User | null;
  recipient?: { value: string; relationTo: NonNullable<User['profile']>['relationTo'] };
};

export const useCreateDonationForm = ({ matchedRequest, user, recipient }: Params) => {
  const profile = extractCollection(user?.profile?.value);
  const preferences = useMemo(() => user?.deliveryPreferences?.docs || [], [user]);

  // #region Queries
  const matchedRequestQuery = useFetchById(Boolean(matchedRequest), {
    collection: 'requests',
    id: matchedRequest,
    populate: { users: { profile: true, profileType: true, role: true } },
  });

  const bagsQuery = useFetchBySlug(
    Boolean(profile),
    {
      collection: 'milkBags',
      select: {
        donor: true,
        volume: true,
        status: true,
        code: true,
        bagImage: true,
        title: true,
        collectedAt: true,
      },
      where: {
        and: [
          { status: { equals: MILK_BAG_STATUS.DRAFT.value } },
          { donor: { equals: profile!.id } },
        ],
      },
      sort: 'createdAt',
    },
    { refetchOnMount: 'always', refetchOnReconnect: 'always' }
  );
  // #endregion

  // #region Form Setup
  const isLoading = matchedRequestQuery.isLoading || bagsQuery.isLoading;
  const isFetching = matchedRequestQuery.isFetching || bagsQuery.isFetching;
  const isRefetching = matchedRequestQuery.isRefetching || bagsQuery.isRefetching;
  const error = matchedRequestQuery.error || bagsQuery.error;

  const matchedRequestDoc = matchedRequestQuery.data;
  const draftMilkBags = useMemo(() => bagsQuery.data || [], [bagsQuery.data]);

  const form = useForm({
    resolver: zodResolver(donationSchema),
    mode: 'onTouched',
    defaultValues: getData(user),
  });

  const storageKey = `${storageKeyPrefix}-${user?.id || ''}`;
  const isSubmitSuccessful = form.formState.isSubmitSuccessful;
  const getValues = form.getValues;
  const reset = form.reset;

  const debouncedSave = debounce((value: DeepPartial<DonationSchema>) => {
    donationStorage.set(storageKey, JSON.stringify(value));
  }, 500);
  // #endregion

  // #region Use Effects
  useEffect(() => {
    const data = getValues();

    if (bagsQuery.isSuccess && draftMilkBags.length) {
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

        newMilkBags[groupID] = bags.map((bag) => ({
          ...bag,
          donor: extractID(bag.donor),
          bagImage: extractImageSchema(extractCollection(bag.bagImage)),
        }));
      }

      data.details.bags = newDetailsBags;
      data.milkBags = newMilkBags;
    }

    reset(data);
  }, [bagsQuery.isSuccess, draftMilkBags, getValues, reset]);

  useEffect(() => {
    let data = getValues();

    if (preferences?.length && !data.deliveryPreferences?.length) {
      data.deliveryPreferences = extractID(preferences);
    }

    // Only set recipient if there is no matched request.
    if (recipient && !matchedRequestDoc) {
      data.recipient = recipient;
    }

    if (matchedRequestDoc) {
      data = updateDataOnMatchedRequest(data, matchedRequestDoc);
    }

    reset(data);
  }, [preferences, matchedRequestDoc, getValues, reset, recipient]);

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

  /**
   * When the form is successfully submitted,
   * and save the preferred values to local storage.
   */
  useEffect(() => {
    async function saveUserPreference() {
      if (isSubmitSuccessful) {
        const data = getValues();

        const preferredValues: DeepPartial<DonationSchema> = {
          details: {
            notes: data.details.notes,
            collectionMode: data.details.collectionMode,
            storageType: data.details.storageType,
          },
          deliveryPreferences: data.deliveryPreferences,
        };

        // Save the preffered values to local storage
        donationStorage.delete(storageKey);
        donationStorage.set(storageKey, JSON.stringify(preferredValues));
      }
    }

    saveUserPreference();
  }, [isSubmitSuccessful, getValues, storageKey]);
  // #endregion

  // #region Form Methods
  function handleRefetch() {
    matchedRequestQuery.refetch();
    bagsQuery.refetch();
  }
  // #endregion

  return { form, isLoading, isFetching, error, isRefetching, refetch: handleRefetch };
};

// #region Helper Functions
function getData(user: User | null): DonationSchema | undefined {
  const profile = extractCollection(user?.profile?.value);
  const storedData = getStoredData(user);
  const donor = profile?.id;
  return {
    ...storedData,
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

function getStoredData(user: User | null): DeepPartial<DonationSchema> | undefined {
  if (!user) return undefined;
  const userID = user.id;
  const storageKey = `${storageKeyPrefix}-${userID}`;
  const raw = donationStorage.getString(storageKey);
  return raw && JSON.parse(raw);
}

function updateDataOnMatchedRequest(data: DonationSchema, matchedRequest: Request): DonationSchema {
  const storagePreference = matchedRequest.details.storagePreference || 'EITHER';
  const volumeNeeded = matchedRequest.volumeNeeded;
  const requesterID = extractID(matchedRequest.requester);

  data.matchedRequest = {
    id: matchedRequest.id,
    requester: requesterID,
    volumeNeeded,
    storagePreference,
  };

  data.recipient = { relationTo: 'individuals', value: requesterID };
  data.details.storageType = storagePreference === 'EITHER' ? 'FRESH' : storagePreference;
  data.details.bags = [
    {
      collectedAt: new Date().toISOString(),
      volume: volumeNeeded,
      quantity: 1,
      donor: data.donor,
      groupID: randomUUID(),
    },
  ];
  return data;
}
// #endregion
