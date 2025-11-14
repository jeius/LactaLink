import { MutationCache, QueryClient, QueryClientProvider, QueryKey } from '@tanstack/react-query';

import React, { ReactNode } from 'react';
import { toast } from 'sonner-native';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      successMessage?: string;
      errorMessage?: string | ((error: unknown) => string);
      invalidatesQuery?: QueryKey;
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
        toast.error(message);
      }
    },

    onSuccess: (_data, _vars, _context, mutation) => {
      if (mutation.meta?.invalidatesQuery) {
        queryClient.invalidateQueries({
          queryKey: mutation.meta.invalidatesQuery,
        });
      }

      if (mutation.meta?.successMessage) {
        toast.success(mutation.meta.successMessage);
      }
    },
  }),
});

export function ReactQuery({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
