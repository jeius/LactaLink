import { useMeUser } from '@/hooks/auth/useAuth';
import { useInfiniteFetchBySlug } from '@/hooks/collections/useInfiniteFetchBySlug';
import { MMKV_KEYS } from '@/lib/constants';
import { INFINITE_QUERY_KEY } from '@/lib/constants/queryKeys';
import localStorage from '@/lib/localStorage';
import { TRANSACTION_STATUS } from '@lactalink/enums';
import { Transaction, User } from '@lactalink/types/payload-generated-types';
import { Where } from '@lactalink/types/payload-types';
import { createStorageKeyByUser, generatePlaceHolders } from '@lactalink/utilities';
import { extractID } from '@lactalink/utilities/extractors';
import { useEffect, useMemo } from 'react';
import { depth, ListData, Overrides } from './utils';

const { LAST_DATA } = MMKV_KEYS.TRANSACTIONS;

const collection = 'transactions';
const placeholder = generatePlaceHolders(15, { id: 'placeholder' } as Transaction);

export function useFetchTransactions(overrides: Overrides = {}) {
  // Get current user to create query filter and storage keys
  const meUser = useMeUser();

  const { fetchOptions, queryKey } = useMemo(() => {
    const where = createQueryFilter(meUser.data?.profile, overrides.where);
    const fetchOptions = { where, sort: '-createdAt', depth };
    const queryKey = [...INFINITE_QUERY_KEY, collection, fetchOptions];
    return { fetchOptions, queryKey };
  }, [meUser.data?.profile, overrides.where]);

  // Load last fetched data from storage as placeholder data
  const { lastStoredData, lastDataKey } = useMemo(() => {
    const baseKey = `${LAST_DATA}-${meUser.data?.id}-${queryKey.map((k) => JSON.stringify(k)).join('-')}`;
    const lastDataKey = createStorageKeyByUser(meUser.data, baseKey);
    const lastFetchedData = localStorage.getString(lastDataKey);

    let parsedData: ListData | undefined = undefined;
    try {
      if (lastFetchedData) {
        parsedData = JSON.parse(lastFetchedData);
      }
    } catch (err) {
      console.warn('Failed to parse stored transactions data', err);
    }

    return { lastDataKey, lastStoredData: parsedData };
  }, [meUser.data, queryKey]);

  // Infinite query to fetch transactions
  const { data: queryData, ...queryRes } = useInfiniteFetchBySlug(
    true,
    { collection, ...fetchOptions },
    { queryKey, placeholderData: lastStoredData }
  );

  const aggregatedResults = useMemo(() => {
    const unSeenData: Transaction[] = [];

    if (queryRes.isLoading) {
      return { data: placeholder, unSeenData };
    }

    const data: Transaction[] = [];

    queryData?.pages.forEach((page) => {
      page.docs.forEach((doc) => {
        data.push(doc);
        if (!doc.seen) {
          unSeenData.push(doc);
        }
      });
    });

    return { data, unSeenData };
  }, [queryRes.isLoading, queryData?.pages]);

  // Persist last fetched data to storage
  useEffect(() => {
    if (queryData) {
      localStorage.set(lastDataKey, JSON.stringify(queryData));
    }
  }, [lastDataKey, queryData]);

  return { ...aggregatedResults, queryKey, ...queryRes };
}

// #region Helpers
function createQueryFilter(profile: User['profile'], override?: Where): Where | undefined {
  if (!profile) return undefined;

  const doneStatuses = [
    TRANSACTION_STATUS.COMPLETED.value,
    TRANSACTION_STATUS.CANCELLED.value,
    TRANSACTION_STATUS.DELIVERED.value,
    TRANSACTION_STATUS.FAILED.value,
  ];

  return {
    and: [
      override || { status: { not_in: doneStatuses } },
      {
        or: [
          {
            and: [
              { 'sender.relationTo': { equals: profile.relationTo } },
              { 'sender.value': { equals: extractID(profile.value) } },
            ],
          },
          {
            and: [
              { 'recipient.relationTo': { equals: profile.relationTo } },
              { 'recipient.value': { equals: extractID(profile.value) } },
            ],
          },
        ],
      },
    ],
  };
}
// #endregion
