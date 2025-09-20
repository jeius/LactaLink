import { User } from '@lactalink/types/payload-generated-types';
import { create } from 'zustand/react';

interface MeUserStoreState {
  meUser: User | null;
  setMeUser: (user: User | null) => void;
}

export const useMeUserStore = create<MeUserStoreState>((set) => ({
  meUser: null,
  setMeUser: (user) => set({ meUser: user }),
}));

export function setMeUser(user: User | null) {
  useMeUserStore.getState().setMeUser(user);
}

export function getMeUser(): User | null {
  return useMeUserStore.getState().meUser;
}
