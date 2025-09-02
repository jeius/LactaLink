import { create } from 'zustand';

type BadgeState = { newCount?: number };

export interface HomeTabsBadgeStoreState {
  transactions: BadgeState;
  notifications: BadgeState;
  incrementBadge: (tab: 'notifications' | 'transactions', count?: number) => void;
  setters: {
    resetTransactionsBadge: () => void;
    resetNotificationsBadge: () => void;
    resetBadges: () => void;
  };
}

export const useHomeTabsBadgeStore = create<HomeTabsBadgeStoreState>((set) => ({
  transactions: {},
  notifications: {},
  incrementBadge: (tab, count) => {
    if (tab === 'notifications') {
      set((s) => ({
        notifications: { newCount: (s.notifications.newCount || 0) + (count || 1) },
      }));
    } else if (tab === 'transactions') {
      set((s) => ({
        transactions: { newCount: (s.transactions.newCount || 0) + (count || 1) },
      }));
    }
  },
  setters: {
    resetTransactionsBadge: () => set((_s) => ({ transactions: {} })),
    resetNotificationsBadge: () => set((_s) => ({ notifications: {} })),
    resetBadges: () => set({ transactions: {}, notifications: {} }),
  },
}));
