import { AnimatedProgress } from '@/components/animated/progress';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { usePagination } from '@/hooks/forms/usePagination';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { SETUP_PROFILE_STEPS } from '@/lib/constants/profile';
import { createDynamicRoute } from '@/lib/utils/createDynamicRoute';
import { Stack } from 'expo-router';
import React from 'react';

const STEPS = createDynamicRoute('/profile/setup', SETUP_PROFILE_STEPS);

export default function Layout() {
  const screenOptions = useScreenOptions();

  const { currentPageIndex, progress } = usePagination(STEPS);

  const hideProgressBar = currentPageIndex < 0;
  const progressBar = (
    <SafeArea safeBottom={false}>
      <Box className="px-5 py-2">
        <AnimatedProgress hidden={hideProgressBar} size="lg" value={progress} />
      </Box>
    </SafeArea>
  );

  return (
    <Stack
      screenOptions={{
        ...screenOptions,
        headerShown: true,
        headerLeft: ({ tintColor }) => <HeaderBackButton tintColor={tintColor} />,
      }}
    >
      <Stack.Screen
        name="setup"
        options={{
          header: () => progressBar,
          headerTransparent: true,
          headerShown: true,
        }}
      />
    </Stack>
  );
}
