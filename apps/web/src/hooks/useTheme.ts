'use client';

import { updateTheme } from '@/lib/api/theme';
import { QUERY_KEYS } from '@/lib/constants';
import { Theme } from '@lactalink/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme as useThemeNext } from 'next-themes';

export function useTheme() {
  const { setTheme, ...rest } = useThemeNext();
  const queryClient = useQueryClient();

  const { mutate: saveThemeToServer } = useMutation({
    mutationFn: updateTheme,
    onError: (error) => {
      console.error('Failed to save theme:', error.message);
    },
    onSuccess: (theme) => {
      queryClient.setQueryData(QUERY_KEYS.THEME, theme);
    },
  });

  function newSetTheme(theme: Theme) {
    saveThemeToServer(theme);
    setTheme(theme);
  }

  return { ...rest, setTheme: newSetTheme };
}
