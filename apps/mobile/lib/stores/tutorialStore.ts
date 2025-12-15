import { getApiClient } from '@lactalink/api';
import { TutorialState, TutorialStateValue } from '@lactalink/types';
import { User } from '@lactalink/types/payload-generated-types';
import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import { updateTutorialState } from '../api/payload-preferences';
import { MMKV_KEYS, QUERY_KEYS } from '../constants';
import localStorage from '../localStorage';

export interface TutorialStoreState extends TutorialState {
  setters: {
    setDonationState: (state: Partial<TutorialStateValue>) => void;
    setState: (state: Partial<TutorialState>) => void;
  };
}

export const useTutorialStore = create<TutorialStoreState>((set) => ({
  donation: { completed: false },
  setters: {
    setDonationState: (newState) =>
      set(({ setters: _, ...state }) => {
        updateTutorialState(state);
        return { donation: { ...state.donation, ...newState } };
      }),
    setState: (state) => set(state),
  },
}));

export function useInitializeTutorialStore(user: User | null) {
  return useQuery({
    enabled: !!user,
    queryKey: QUERY_KEYS.TUTORIAL_STATE,
    queryFn: async () => {
      if (!user) return null;

      const client = getApiClient();
      const tutorialKey = MMKV_KEYS.TUTORIAL_STATE.trim();
      const storageKey = tutorialKey + '-' + user.id.trim();

      const state = await client.getPreference<TutorialState>(tutorialKey);
      if (state) {
        localStorage.set(storageKey, JSON.stringify(state));
        useTutorialStore.setState(state);
      }

      return state;
    },
    placeholderData: (prev) => {
      if (!prev && user) return getStoredTutorialState(user.id);
      return prev;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 3,
  });
}

function getStoredTutorialState(userID: string) {
  const tutorialKey = MMKV_KEYS.TUTORIAL_STATE.trim();
  const storageKey = tutorialKey + '-' + userID.trim();
  const storedState = localStorage.getString(storageKey);

  if (storedState) {
    return JSON.parse(storedState) as TutorialState;
  } else {
    return;
  }
}
