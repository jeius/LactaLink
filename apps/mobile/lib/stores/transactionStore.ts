import { useMeUser } from '@/hooks/auth/useAuth';
import { useInfiniteFetchBySlug } from '@/hooks/collections/useInfiniteFetchBySlug';
import { PaginatedDocs, Transaction, User, Where } from '@lactalink/types';
import { createStorageKeyByUser, extractID, generatePlaceHolders } from '@lactalink/utilities';
import { InfiniteData } from '@tanstack/react-query';
import { isEqual } from 'lodash';
import { useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { MMKV_KEYS, TRANSACTION_STATUS } from '../constants';
import { INFINITE_QUERY_KEY } from '../constants/queryKeys';
import localStorage from '../localStorage';

const { LAST_DATA, LAST_FETCH } = MMKV_KEYS.TRANSACTIONS;

const depth = 3;
const collection = 'transactions';
const placeholder = generatePlaceHolders(15, { id: 'placeholder' } as Transaction);
type ListData = InfiniteData<PaginatedDocs<Transaction>>;

interface TransactionStoreState {
  transactions: Transaction[];
  badgeStates: { newDataAvailable?: boolean; newCount?: number };
  setters: {
    setTransactions: (transactions: Transaction[]) => void;
    setNewCount: (count: number | undefined) => void;
    setNewDataAvailable: (val: boolean | undefined) => void;
    setBadgeStates: (states: Partial<TransactionStoreState['badgeStates']>) => void;
    resetBadgeStates: () => void;
  };
}

export const useTransactionStore = create<TransactionStoreState>((set) => ({
  transactions: [],
  badgeStates: {},
  setters: {
    setTransactions: (transactions: Transaction[]) => set({ transactions }),
    setNewCount: (count: number | undefined) => set({ badgeStates: { newCount: count } }),
    setNewDataAvailable: (val: boolean | undefined) =>
      set({ badgeStates: { newDataAvailable: val } }),
    setBadgeStates: (states: Partial<TransactionStoreState['badgeStates']>) =>
      set((s) => ({ badgeStates: { ...s.badgeStates, ...states } })),
    resetBadgeStates: () => set({ badgeStates: {} }),
  },
}));

interface Overrides {
  where?: Where;
}

export function useFetchTransactions(overrides: Overrides = {}) {
  const setters = useTransactionStore((s) => s.setters);

  // Get current user to create query filter and storage keys
  const meUser = useMeUser();
  const where = createQueryFilter(meUser.data?.profile, overrides.where);
  const fetchOptions = { where, sort: '-createdAt', depth };

  const queryKey = [...INFINITE_QUERY_KEY, collection, fetchOptions];

  // Load last fetched data from storage as placeholder data
  const lastDataKey = useMemo(() => createStorageKeyByUser(meUser.data, LAST_DATA), [meUser.data]);
  const lastFetchedData = useMemo(() => {
    // localStorage.delete(lastDataKey); // For testing purposes
    const storedData = localStorage.getString(lastDataKey);
    if (!storedData) return undefined;
    try {
      return JSON.parse(storedData) as ListData;
    } catch {
      return undefined;
    }
  }, [lastDataKey]);

  // Infinite query to fetch transactions
  const { data: queryData, ...queryRes } = useInfiniteFetchBySlug(
    true,
    { collection, ...fetchOptions },
    { queryKey, placeholderData: lastFetchedData }
  );

  const { data, newCount, changed } = useMemo(() => {
    const isLoading = queryRes.isLoading;
    const data = queryData?.pages.flatMap((page) => page.docs) || [];
    const oldData = lastFetchedData?.pages.flatMap((page) => page.docs) || [];

    const changed = queryData && !isEqual(queryData, lastFetchedData);
    const newCount = Math.max(0, data.length - oldData.length);

    return {
      data: isLoading ? placeholder : data,
      changed,
      newCount: isLoading && newCount === 0 ? undefined : newCount,
    };
  }, [queryRes.isLoading, queryData, lastFetchedData]);

  // Sync zustand store with intitialized notifications
  useEffect(() => {
    setters.setTransactions(data);
    setters.setBadgeStates({ newDataAvailable: changed, newCount });
  }, [changed, data, newCount, setters]);

  function markDataAsSeen() {
    if (!changed) return;

    const { resetBadgeStates } = setters;
    resetBadgeStates();

    localStorage.set(createStorageKeyByUser(meUser.data, LAST_FETCH), new Date().toISOString());
    localStorage.set(lastDataKey, JSON.stringify(queryData));
  }

  return { data, markDataAsSeen, queryKey, ...queryRes };
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
