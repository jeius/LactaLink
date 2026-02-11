import { TOAST_ID } from '@/lib/constants';
import { MutationCache, QueryClient, QueryClientProvider, QueryKey } from '@tanstack/react-query';

import React, { ReactNode } from 'react';
import { toast } from 'sonner-native';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      successMessage?: string | ((data: any) => string);
      errorMessage?: string | ((error: unknown) => string);
      invalidatesQuery?: QueryKey | Record<string, QueryKey>;
      onError?: (error: unknown) => void;
    };
  }
}

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _vars, _context, mutation) => {
      if (mutation.meta?.errorMessage) {
        let message = '';
        if (typeof mutation.meta.errorMessage === 'function') {
          message = mutation.meta.errorMessage(error);
        } else {
          message = mutation.meta.errorMessage;
        }
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

      if (mutation.meta?.successMessage) {
        let message = '';
        if (typeof mutation.meta.successMessage === 'function') {
          message = mutation.meta.successMessage(data);
        } else {
          message = mutation.meta.successMessage;
        }
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
