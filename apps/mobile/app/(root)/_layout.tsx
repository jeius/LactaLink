import { AnimatedProgress } from '@/components/animated/progress';
import { useTheme } from '@/components/AppProvider/ThemeProvider';
import Avatar from '@/components/Avatar';
import { Box } from '@/components/ui/box';
import { useAuth } from '@/hooks/auth/useAuth';
import { usePagination } from '@/hooks/forms/usePagination';
import { getHexColor } from '@/lib/colors';
import { SETUP_PROFILE_STEPS } from '@/lib/constants/profile';
import { createDynamicRoute } from '@/lib/utils/createDynamicRoute';
import { extractName } from '@lactalink/utilities';
import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const STEPS = createDynamicRoute('/setup-profile', SETUP_PROFILE_STEPS);

export default function Layout() {
  const { user, profile } = useAuth();
  const { theme } = useTheme();

  const userName = user && extractName(user);
  const headerBgColor = getHexColor(theme, 'background', 0);
  const headerTintColor = getHexColor(theme, 'typography', 900);
  const bgColor = getHexColor(theme, 'background', 50);

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
        headerShown: false,
        headerRight: () => <Avatar />,
        headerTitleStyle: {
          fontFamily: 'Jakarta-SemiBold',
          fontSize: 16,
        },
        headerStyle: { backgroundColor: headerBgColor?.toString() },
        headerBackButtonDisplayMode: 'minimal',
        headerBackVisible: false,
        headerTintColor: headerTintColor?.toString(),
        contentStyle: { backgroundColor: bgColor },
      }}
    >
      <Stack.Protected guard={!profile}>
        <Stack.Screen
          name="setup-profile"
          options={{ header: () => progressBar, headerTransparent: true, headerShown: true }}
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
