/**
 * useAppToast and getAppToast provide convenient access to global toast actions.
 *
 * - useAppToast: React hook for accessing toast actions (show, close, closeAll, isActive) in components.
 * - getAppToast: Utility function for accessing toast actions outside of React components (e.g., in utilities or async logic).
 *
 * Both are backed by the ToastStore, which must be initialized by the Toast component at the app root.
 */

import { useToastStore } from '@/lib/toaster/toastStore';

/**
 * getAppToast returns toast actions for use outside React components.
 * It omits the internal toast instance and init function from the store.
 */
export function getAppToast() {
  const { toast: _, init: __, showToast, ...rest } = useToastStore.getState();
  return { show: showToast, ...rest };
}

/**
 * useAppToast is a React hook that returns toast actions for use within components.
 */
export function useAppToast() {
  const show = useToastStore((s) => s.showToast);
  const close = useToastStore((s) => s.close);
  const closeAll = useToastStore((s) => s.closeAll);
  const isActive = useToastStore((s) => s.isActive);

  return { show, close, closeAll, isActive };
}
