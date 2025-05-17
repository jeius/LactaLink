import { AnimatedProgress } from '@/components/animated-progress';
import { Box } from '@/components/ui/box';
import { usePagination } from '@/hooks/forms/usePagination';
import { SETUP_PROFILE_STEPS } from '@/lib/constants';
import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Layout() {
  const { currentPageIndex, progress } = usePagination(SETUP_PROFILE_STEPS);

  const hideProgressBar = currentPageIndex < 0;
  const progressBar = (
    <SafeAreaView>
      <Box className="px-5 py-2">
        <AnimatedProgress hidden={hideProgressBar} size="lg" value={progress} />
      </Box>
    </SafeAreaView>
  );

  return (
    <Stack>
      <Stack.Screen
        name="setup-profile"
        options={{ header: () => progressBar, headerTransparent: true }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="welcome/index" options={{ headerShown: false }} />
    </Stack>
  );
}
