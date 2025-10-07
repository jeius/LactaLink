import { create } from 'zustand';
import { MMKV_KEYS } from '../constants/storageKeys';
import localStorage from '../localStorage';

interface OnboardingState {
  viewed: boolean;
  setViewed: (val: boolean) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => {
  const storedState = localStorage.getBoolean(MMKV_KEYS.ONBOARDING);

  return {
    viewed: storedState || false,
    setViewed: (val) => {
      set({ viewed: val });
      localStorage.set(MMKV_KEYS.ONBOARDING, val);
    },
  };
});
