import { TutorialState, TutorialStateValue, User } from '@lactalink/types';
import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import { getTutorialState, updateTutorialState } from '../api/payload-preferences';
import { QUERY_KEYS } from '../constants';

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
        updateTutorialState({ ...state });
        return { donation: { ...state.donation, ...newState } };
      }),
    setState: (state) => set((s) => ({ ...s, ...state })),
  },
}));

export function useInitializeTutorialStore(user: User | null) {
  return useQuery({
    enabled: Boolean(user),
    queryKey: QUERY_KEYS.TUTORIAL_STATE,
    queryFn: async () => {
      if (!user) {
        return null;
      }

      const tutorialState = await getTutorialState(user.id);

      if (tutorialState) {
        useTutorialStore.setState(tutorialState);
      }

      return tutorialState;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 3,
  });
}
