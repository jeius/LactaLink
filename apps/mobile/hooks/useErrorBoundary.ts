import { ErrorSearchParams } from '@lactalink/types';
import {
  extractErrorMessage,
  extractErrorStatus,
  extractErrorStatusText,
} from '@lactalink/utilities/extractors';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

/**
 * Custom hook to handle errors and navigate to a dedicated error screen with
 * relevant information.
 *
 * @param error - The error object to be handled.
 * @returns void
 */
export function useErrorBoundary(
  error: unknown,
  { navigationType = 'push' }: { navigationType?: 'push' | 'replace' } = {}
) {
  const router = useRouter();

  useEffect(() => {
    if (error) {
      const params: ErrorSearchParams = {
        message: extractErrorMessage(error),
        title: extractErrorStatusText(error) || 'Error Found',
        status: extractErrorStatus(error).toString(),
      };

      if (navigationType === 'push') {
        router.push({ pathname: '/error', params });
      } else {
        router.replace({ pathname: '/error', params });
      }
    }
  }, [error, navigationType, router]);
}
