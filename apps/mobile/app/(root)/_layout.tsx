import { AnimatedProgress } from '@/components/animated/progress';
import Avatar from '@/components/Avatar';
import { Box } from '@/components/ui/box';
import { useAuth } from '@/hooks/auth/useAuth';
import { usePagination } from '@/hooks/forms/usePagination';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { SETUP_PROFILE_STEPS } from '@/lib/constants/profile';
import { createDynamicRoute } from '@/lib/utils/createDynamicRoute';
import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const STEPS = createDynamicRoute('/setup-profile', SETUP_PROFILE_STEPS);

export default function Layout() {
  const { profile, isLoading, isFetching } = useAuth();
  const screenOptions = useScreenOptions();

  const noProfile = !isLoading && !isFetching && !profile;

  const { currentPageIndex, progress } = usePagination(STEPS);

  const hideProgressBar = currentPageIndex < 0;
  const progressBar = (
    <SafeAreaView>
      <Box className="px-5 py-2">
        <AnimatedProgress hidden={hideProgressBar} size="lg" value={progress} />
      </Box>
    </SafeAreaView>
  );

  return (
    <Stack
      screenOptions={{
        ...screenOptions,
        headerRight: () => <Avatar />,
      }}
    >
      <Stack.Protected guard={noProfile}>
        <Stack.Screen
          name="setup-profile"
          options={{
            header: () => progressBar,
            headerTransparent: true,
            headerShown: true,
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!noProfile}>
        <Stack.Screen name="(drawer)" />
      </Stack.Protected>
    </Stack>
  );
}
