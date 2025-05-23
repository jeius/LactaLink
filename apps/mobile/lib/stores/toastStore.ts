import { create } from 'zustand';
import { ToastShowArgs } from '../toaster';

type ToastStore = {
  toastArgs: ToastShowArgs | null;
  showToast: (args: ToastShowArgs) => void;
  clearToast: () => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toastArgs: null,
  showToast: (args) => set({ toastArgs: args }),
  clearToast: () => set({ toastArgs: null }),
}));
