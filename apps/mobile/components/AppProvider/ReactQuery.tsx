import { TOAST_ID } from '@/lib/constants';
import { MutationCache, QueryClient, QueryClientProvider, QueryKey } from '@tanstack/react-query';

import React, { ReactNode } from 'react';
import { toast } from 'sonner-native';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      successMessage?: string | ((data: any) => string | null | undefined) | null;
      errorMessage?: string | ((error: unknown) => string | null | undefined) | null;
      invalidatesQuery?: QueryKey | Record<string, QueryKey>;
      onError?: (error: unknown) => void;
    };
  }
}

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _vars, _context, mutation) => {
      let message: string | null = null;

      if (mutation.meta?.errorMessage) {
        if (typeof mutation.meta.errorMessage === 'function') {
          const msg = mutation.meta.errorMessage(error);
          message = msg || null;
        } else {
          message = mutation.meta.errorMessage;
        }
      }

      if (message) {
        toast.error(message, { id: TOAST_ID.ERROR });
      }
    },

    onSuccess: async (data, _vars, _context, mutation) => {
      const queryKey = mutation.meta?.invalidatesQuery;

      if (Array.isArray(queryKey)) {
        await queryClient.invalidateQueries({ queryKey: queryKey });
      } else if (queryKey && typeof queryKey === 'object') {
        await Promise.all(
          Object.values(queryKey as Record<string, QueryKey>).map((key) =>
            queryClient.invalidateQueries({ queryKey: key })
          )
        );
      }

      let message: string | null = null;

      if (mutation.meta?.successMessage) {
        if (typeof mutation.meta.successMessage === 'function') {
          const msg = mutation.meta.successMessage(data);
          message = msg || null;
        } else {
          message = mutation.meta.successMessage;
        }
      }

      if (message) {
        toast.success(message, { id: TOAST_ID.SUCCESS });
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3, // 3 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

export function ReactQuery({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
