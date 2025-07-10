import { AnimatedProgress } from '@/components/animated/progress';
import Avatar from '@/components/Avatar';
import { Box } from '@/components/ui/box';
import { useAuth } from '@/hooks/auth/useAuth';
import { usePagination } from '@/hooks/forms/usePagination';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { SETUP_PROFILE_STEPS } from '@/lib/constants/profile';
import { createDynamicRoute } from '@/lib/utils/createDynamicRoute';
import { extractName } from '@lactalink/utilities';
import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const STEPS = createDynamicRoute('/setup-profile', SETUP_PROFILE_STEPS);

export default function Layout() {
  const { user, profile } = useAuth();
  const screenOptions = useScreenOptions();

  const userName = user && extractName(user);

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
        headerShown: false,
        headerRight: () => <Avatar />,
      }}
    >
      <Stack.Protected guard={!profile}>
        <Stack.Screen
          name="setup-profile"
          options={{
            header: () => progressBar,
            headerTransparent: true,
            headerShown: true,
          }}
        />
      </Stack.Protected>

      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: true,
          headerTitle: (userName && `Welcome, ${userName}!`) || 'Welcome!',
        }}
      />
    </Stack>
  );
}
