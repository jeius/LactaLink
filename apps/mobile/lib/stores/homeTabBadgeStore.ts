import { create } from 'zustand';
import { MMKV_KEYS } from '../constants';
import localStorage from '../localStorage';

const { NOTIFICATIONS, TRANSACTIONS } = MMKV_KEYS;

const NOTIFICATIONS_NEW_IDS_KEY = NOTIFICATIONS.NEW_DATA_IDS;
const TRANSACTIONS_NEW_IDS_KEY = TRANSACTIONS.NEW_DATA_IDS;

type BadgeState = { newDataIDs: string[] };

export interface HomeTabsBadgeStoreState {
  transactions: BadgeState;
  notifications: BadgeState;
  resetTransactions: () => void;
  resetNotifications: () => void;
  setNewNotificationsIDs: (ids: string[]) => void;
  setNewTransactionsIDs: (ids: string[]) => void;
  pushNewNotificationID: (id: string | string[]) => void;
  pushNewTransactionID: (id: string | string[]) => void;
  reset: () => void;
}

export const useHomeTabsBadgeStore = create<HomeTabsBadgeStoreState>((set) => {
  const storedNewNotificationsIDs = localStorage.getString(NOTIFICATIONS_NEW_IDS_KEY);
  const storedNewTransactionsIDs = localStorage.getString(TRANSACTIONS_NEW_IDS_KEY);

  const initialState: BadgeState = { newDataIDs: [] };

  return {
    transactions: {
      newDataIDs: (storedNewTransactionsIDs && JSON.parse(storedNewTransactionsIDs)) || [],
    },
    notifications: {
      newDataIDs: (storedNewNotificationsIDs && JSON.parse(storedNewNotificationsIDs)) || [],
    },
    resetTransactions: () => {
      set((_s) => ({ transactions: initialState }));
      localStorage.delete(TRANSACTIONS_NEW_IDS_KEY);
    },
    resetNotifications: () => {
      set((_s) => ({ notifications: initialState }));
      localStorage.delete(NOTIFICATIONS_NEW_IDS_KEY);
    },
    reset: () => {
      set({ transactions: initialState, notifications: initialState });
      localStorage.delete(TRANSACTIONS_NEW_IDS_KEY);
      localStorage.delete(NOTIFICATIONS_NEW_IDS_KEY);
    },
    setNewNotificationsIDs: (ids: string[]) => {
      set(() => ({ notifications: { newDataIDs: ids } }));
      localStorage.set(NOTIFICATIONS_NEW_IDS_KEY, JSON.stringify(ids));
    },
    setNewTransactionsIDs: (ids: string[]) => {
      set(() => ({ transactions: { newDataIDs: ids } }));
      localStorage.set(TRANSACTIONS_NEW_IDS_KEY, JSON.stringify(ids));
    },
    pushNewNotificationID: (id: string | string[]) => {
      set((prev) => {
        const newIDs = Array.isArray(id) ? id : [id];
        const updatedIDs = Array.from(new Set([...prev.notifications.newDataIDs, ...newIDs]));
        localStorage.set(NOTIFICATIONS_NEW_IDS_KEY, JSON.stringify(updatedIDs));
        return { notifications: { newDataIDs: updatedIDs } };
      });
    },
    pushNewTransactionID: (id: string | string[]) => {
      set((prev) => {
        const newIDs = Array.isArray(id) ? id : [id];
        const updatedIDs = Array.from(new Set([...prev.transactions.newDataIDs, ...newIDs]));
        localStorage.set(TRANSACTIONS_NEW_IDS_KEY, JSON.stringify(updatedIDs));
        return { transactions: { newDataIDs: updatedIDs } };
      });
    },
  };
});
