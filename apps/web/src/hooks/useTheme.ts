'use client';

import { updateTheme } from '@/lib/api/theme';
import { QUERY_KEYS } from '@/lib/constants';
import { Theme } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme as useThemeNext } from 'next-themes';

export function useTheme() {
  const { setTheme, ...rest } = useThemeNext();
  const queryClient = useQueryClient();

  const { mutate: saveThemeToServer } = useMutation({
    mutationFn: updateTheme,
    onError: (error) => {
      console.error('Failed to save theme:', extractErrorMessage(error));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.THEME });
    },
  });

  function syncTheme(theme: Theme) {
    saveThemeToServer(theme);
    setTheme(theme);
  }

  return { ...rest, setTheme: syncTheme };
}
