/**
 * ToastStore for global toast management.
 *
 * This store is designed to work with the Toast and Toaster components from ..toaster.
 * The Toast component initializes the store by injecting the current toast instance (from useToast).
 * This enables toast actions (show, close, closeAll, isActive) to be triggered from anywhere in the app,
 * even outside of React components.
 *
 * The store exposes:
 * - showToast: Show a toast of any type (success, error, loading) using the custom renderers.
 * - close: Close a toast by id.
 * - closeAll: Close all toasts.
 * - isActive: Check if a toast with a given id is active.
 * - init: Initialize the store with the toast instance (must be called from a React component).
 *
 * The renderToast utility handles rendering the correct toast variant and ensures swipe-to-dismiss support.
 *
 * Usage:
 *   1. The Toast component (see ../toaster) must be mounted at the root of your app to call init().
 *   2. Use useToastStore().showToast({...}) anywhere to trigger a toast.
 */

import { useToast } from '@/components/ui/toast';
import { create } from 'zustand';
import { ToastShowArgs, errorToast, loadingToast, successToast } from '.';

type ToastStore = {
  toast: ReturnType<typeof useToast> | null;
  showToast: (args: ToastShowArgs) => void;
  close: (id: string) => void;
  closeAll: () => void;
  isActive: (id: string) => boolean;
  init: (toast: ReturnType<typeof useToast>) => void;
};

/**
 * renderToast is a utility function that renders a toast using the correct renderer
 * (success, error, or loading) based on the type provided in args.
 * It also attaches an onDismiss handler for swipe-to-dismiss support.
 */
function renderToast(args: ToastShowArgs, toast: ReturnType<typeof useToast>) {
  const { id, message: title, type, description, placement, ...options } = args;

  function onDismiss() {
    if (id) toast.close(id);
  }

  const renderFn = {
    success: (id: string) => successToast({ id, message: title, description, onDismiss }),
    error: (id: string) => errorToast({ id, message: title, description, onDismiss }),
    loading: (id: string) => loadingToast({ id, message: title, description, onDismiss }),
  };

  toast.show({
    id,
    placement: placement || 'top',
    duration: type === 'loading' ? null : 4000,
    render: ({ id }) => renderFn[type](id),
    ...options,
  });
}

/**
 * useToastStore is a Zustand store that provides global toast actions.
 *
 * - toast: The current toast instance (set by init).
 * - showToast: Show a toast of any type using renderToast.
 * - close: Close a toast by id.
 * - closeAll: Close all toasts.
 * - isActive: Check if a toast with a given id is active.
 * - init: Initialize the store with the toast instance (must be called from a React component).
 */
export const useToastStore = create<ToastStore>((set, get) => {
  return {
    toast: null,

    /**
     * init initializes the store with the toast instance.
     * Must be called from a React component (see Toast in ../toaster).
     */
    init: (toast) => {
      set(() => ({
        toast,
        /**
         * showToast shows a toast using the provided arguments and the initialized toast instance.
         */
        showToast: (args) => {
          renderToast(args, toast);
        },
        /**
         * close closes a toast by its id.
         */
        close: (id) => {
          toast.close(id);
        },
        /**
         * closeAll closes all active toasts.
         */
        closeAll: () => {
          toast.closeAll();
        },
        /**
         * isActive checks if a toast with the given id is currently active.
         */
        isActive: (id) => toast.isActive(id),
      }));
    },

    /**
     * showToast shows a toast using the current toast instance (if initialized).
     */
    showToast: (args) => {
      const toast = get().toast;
      toast && renderToast(args, toast);
    },

    /**
     * close closes a toast by its id using the current toast instance.
     */
    close: (id) => {
      const toast = get().toast;
      toast?.close(id);
    },

    /**
     * closeAll closes all active toasts using the current toast instance.
     */
    closeAll: () => {
      const toast = get().toast;
      toast?.closeAll();
    },

    /**
     * isActive checks if a toast with the given id is currently active.
     */
    isActive: (id) => {
      const toast = get().toast;
      return toast?.isActive(id) || false;
    },
  };
});
