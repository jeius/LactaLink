import { donationStorage } from '@/lib/localStorage';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DonationSchema,
  donationSchema,
  Hospital,
  Individual,
  MilkBank,
  Request,
  User,
} from '@lactalink/types';

import { MILK_BAG_STATUS } from '@/lib/constants';
import { segregateMilkBags } from '@/lib/utils/segregateMilkBags';
import { extractID } from '@lactalink/utilities';
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
  profile: Individual | Hospital | MilkBank | null;
  recipient?: User['profile'];
};

export const useCreateDonationForm = ({ matchedRequest, user, profile, recipient }: Params) => {
  const preferences = useMemo(() => user?.deliveryPreferences?.docs || [], [user]);

  const matchedRequestQuery = useFetchById(Boolean(matchedRequest), {
    collection: 'requests',
    id: matchedRequest,
    populate: { users: { profile: true, profileType: true, role: true } },
  });

  const bagsQuery = useFetchBySlug(Boolean(profile), {
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
  });

  const isLoading = matchedRequestQuery.isLoading || bagsQuery.isLoading;
  const isFetching = matchedRequestQuery.isFetching || bagsQuery.isFetching;
  const error = matchedRequestQuery.error || bagsQuery.error;

  const matchedRequestDoc = matchedRequestQuery.data;
  const draftMilkBags = useMemo(() => bagsQuery.data || [], [bagsQuery.data]);

  const form = useForm({
    resolver: zodResolver(donationSchema),
    mode: 'onTouched',
    defaultValues: getData({ user, profile }),
  });

  const storageKey = `${storageKeyPrefix}-${user?.id || ''}`;
  const isSubmitSuccessful = form.formState.isSubmitSuccessful;
  const getValues = form.getValues;
  const reset = form.reset;

  const debouncedSave = debounce((value: DeepPartial<DonationSchema>) => {
    donationStorage.set(storageKey, JSON.stringify(value));
  }, 1000);

  useEffect(() => {
    if (!isLoading) {
      let data = getValues();

      if (preferences?.length) {
        data.deliveryPreferences = extractID(preferences);
      }

      if (draftMilkBags.length) {
        const segregatedBags = segregateMilkBags(draftMilkBags);

        const newDetailsBags: DonationSchema['details']['bags'] = [];
        const newMilkBags: DonationSchema['milkBags'] = {};

        for (const [key, bags] of Object.entries(segregatedBags)) {
          if (bags.length === 0) continue;

          const groupID = randomUUID();

          newDetailsBags.push({
            donor: extractID(bags[0]!.donor),
            volume: bags[0]!.volume,
            quantity: parseInt(key),
            collectedAt: bags[0]!.collectedAt,
            groupID,
          });

          newMilkBags[groupID] = bags.map((bag) => ({
            ...bag,
            donor: extractID(bag.donor),
            bagImage: null, // Set null, since draft milk bags does not have an image yet.
          }));
        }

        data.details.bags = newDetailsBags;
        data.milkBags = newMilkBags;
      }

      if (recipient) {
        data.recipient = {
          relationTo: recipient.relationTo,
          value: extractID(recipient.value),
        };
      }

      data = updateDataOnMatchedRequest(data, matchedRequestDoc);

      reset(data);
    }
  }, [isLoading, preferences, matchedRequestDoc, draftMilkBags, getValues, reset, recipient]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      debouncedSave(values);
    });

    return () => {
      subscription.unsubscribe();
      debouncedSave.cancel();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * When the form is successfully submitted, clear the local storage
   * and save the user preference to local storage.
   */
  useEffect(() => {
    async function saveUserPreference() {
      if (isSubmitSuccessful) {
        donationStorage.delete(storageKey);

        const data = getValues();

        const values: DeepPartial<DonationSchema> = {
          details: {
            notes: data.details.notes,
            collectionMode: data.details.collectionMode,
            storageType: data.details.storageType,
          },
          deliveryPreferences: data.deliveryPreferences,
        };

        // Save the preffered values to local storage
        donationStorage.set(storageKey, JSON.stringify(values));
      }
    }

    saveUserPreference();
  }, [isSubmitSuccessful, getValues, storageKey]);

  return { form, isLoading, isFetching, error };
};

function getData({ user, profile }: Params): DonationSchema | undefined {
  const storedData = getStoredData(user);
  const donor = profile?.id;
  return {
    ...storedData,
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

function updateDataOnMatchedRequest(
  data: DonationSchema,
  matchedRequest: Request | null | undefined
): DonationSchema {
  if (matchedRequest) {
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
  }
  return data;
}
