import { useTheme } from '@/components/AppProvider/ThemeProvider';
import Avatar from '@/components/Avatar';
import { getHexColor } from '@/lib/colors';
import { DonationRequestSlug } from '@/lib/types/donationRequest';
import { capitalizeFirst } from '@lactalink/utilities';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { StackAnimationTypes } from 'react-native-screens';

const ALLOWED_SLUGS: DonationRequestSlug[] = ['donations', 'requests'];

export default function Layout() {
  const { slug } = useLocalSearchParams<{ slug: DonationRequestSlug }>();
  const capitalizedSlug = capitalizeFirst(slug);

  const isIOS = Platform.OS === 'ios';
  const animation: StackAnimationTypes = isIOS ? 'ios_from_right' : 'slide_from_right';

  const { theme } = useTheme();
  const headerBgColor = getHexColor(theme, 'background', 0);
  const headerTintColor = getHexColor(theme, 'typography', 900);

  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: true,
        headerRight: () => <Avatar />,
        headerTitleStyle: {
          fontFamily: 'Jakarta-SemiBold',
          fontSize: 16,
        },
        headerStyle: { backgroundColor: headerBgColor?.toString() },
        headerBackButtonDisplayMode: 'minimal',
        headerBackVisible: true,
        headerTintColor: headerTintColor?.toString(),
        animation,
      }}
    >
      <Stack.Screen name="index" options={{ headerTitle: capitalizedSlug }} />

      <Stack.Protected guard={ALLOWED_SLUGS.includes(slug)}>
        <Stack.Screen
          name="create"
          options={{ headerTitle: `Create ${capitalizedSlug.slice(0, -1)}` }}
        />
      </Stack.Protected>
    </Stack>
  );
}
