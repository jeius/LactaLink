import { getApiClient } from '@lactalink/api';
import { REALTIME_SUBSCRIBE_STATES, RealtimeChannel } from '@supabase/supabase-js';
import { create } from 'zustand/react';
import { supabase } from '../supabase';
import { getMeUser } from './meUserStore';

type PresenceData = {
  userID: string;
  onlineAt?: string;
};

export type Presence = {
  isOnline: boolean;
  onlineAt?: string;
  offlineAt?: string;
};

interface PresenceStore {
  channel: RealtimeChannel | null;
  users: Map<string, Presence>;
  actions: {
    subscribe: () => Promise<void>;
    unsubscribe: () => Promise<void>;
  };
}

const CHANNEL_NAME = 'users:presence';
const SUBSCRIBED = REALTIME_SUBSCRIBE_STATES.SUBSCRIBED;

const usePresenceStore = create<PresenceStore>((set, get) => ({
  users: new Map<string, Presence>(),
  channel: null,
  actions: {
    subscribe: async () => {
      if (get().channel) return; // Already subscribed

      // Create presence channel
      const channel = supabase.channel(CHANNEL_NAME);

      // Initialize users map with current presence state
      const users = new Map(get().users);
      const presenceState = channel.presenceState<PresenceData>();

      Object.values(presenceState).forEach((presences) => {
        for (const p of presences) {
          users.set(p.userID, {
            isOnline: true,
            onlineAt: p.onlineAt,
          });
        }
      });

      set({ users: users });

      // Attach listeners
      channel
        // On join presence
        .on<PresenceData>('presence', { event: 'join' }, ({ newPresences }) => {
          const newUsers = new Map(get().users);
          for (const { userID, onlineAt } of newPresences) {
            const now = new Date().toISOString();
            newUsers.set(userID, { isOnline: true, onlineAt: onlineAt || now });
          }
          set({ users: newUsers });
        })
        // On leave presence
        .on<PresenceData>('presence', { event: 'leave' }, ({ leftPresences }) => {
          const newUsers = new Map(get().users);
          for (const { userID } of leftPresences) {
            const now = new Date().toISOString();
            newUsers.set(userID, { isOnline: false, offlineAt: now });
          }
          set({ users: newUsers });
        });

      // Subscribe to channel
      channel.subscribe(async (status) => {
        if (status === SUBSCRIBED) {
          // Save channel to store
          set({ channel });
          // Track current user presence
          trackMePresence(channel);
        } else if (status !== REALTIME_SUBSCRIBE_STATES.CLOSED) {
          console.error('Presence subscription error:', status);
          throw new Error('Failed to subscribe to presence channel: ' + status);
        }
      });
    },
    unsubscribe: async () => {
      const channel = get().channel;
      if (!channel) return; // Not subscribed

      // Unsubscribe from channel
      const result = await supabase.removeChannel(channel);
      if (result !== 'ok') {
        throw new Error('Failed to unsubscribe from presence channel');
      }

      // Clear channel from store
      set({ channel: null });

      // Update current user's online timestamp
      await getApiClient().auth.getMeUser();
    },
  },
}));

/**
 * Get presence map of all users.
 * @returns `Presence` Map with `UserID` as key
 */
export const useUsersPresence = () => usePresenceStore((s) => s.users);

/**
 * Set current user as online in presence channel.
 * This function should only be called when the user comes online
 * (e.g., app foreground, network reconnect) or offline (app background, network disconnect).
 * @param val Whether to set the user as online (true) or offline (false). Default is `true`.
 *
 */
export async function setMeOnline(val: boolean = true) {
  const { subscribe, unsubscribe } = usePresenceStore.getState().actions;
  if (val) await subscribe();
  else await unsubscribe();
}

/**
 * Tracks the current user's presence in the given Realtime channel.
 * @param channel `RealtimeChannel`
 * @returns
 */
async function trackMePresence(channel: RealtimeChannel) {
  const meUser = getMeUser();
  if (!meUser) return Promise.resolve(null);
  return channel.track({ userID: meUser.id, onlineAt: new Date().toISOString() } as PresenceData);
}
