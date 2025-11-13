import { MutationCache, QueryClient, QueryClientProvider, QueryKey } from '@tanstack/react-query';

import React, { ReactNode } from 'react';
import { toast } from 'sonner-native';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      successMessage?: string;
      errorMessage?: string;
      invalidatesQuery?: QueryKey;
    };
  }
}

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (_error, _vars, _context, mutation) => {
      if (mutation.meta?.errorMessage) {
        toast.error(mutation.meta.errorMessage);
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
