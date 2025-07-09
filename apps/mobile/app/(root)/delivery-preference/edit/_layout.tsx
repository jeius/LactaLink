import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { FormBackButton } from '@/components/forms/FormBackButton';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import { useDeliveryPreferenceForm } from '@/hooks/forms';
import { getHexColor } from '@/lib/colors';
import { ErrorSearchParams } from '@lactalink/types';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FormProvider } from 'react-hook-form';

export default function Layout() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const headerBgColor = getHexColor(theme, 'background', 0);
  const headerTintColor = getHexColor(theme, 'typography', 900);
  const bgColor = getHexColor(theme, 'background', 50);

  const { form, isLoading, isFetching, error } = useDeliveryPreferenceForm(id);

  if (!isLoading && error) {
    const params: ErrorSearchParams = { message: error.message };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  return (
    <FormProvider {...form}>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTitle: 'Edit Delivery Preference',
          headerTitleStyle: {
            fontFamily: 'Jakarta-SemiBold',
            fontSize: 16,
          },
          headerStyle: { backgroundColor: headerBgColor?.toString() },
          headerBackButtonDisplayMode: 'minimal',
          headerTintColor: headerTintColor?.toString(),
          contentStyle: { backgroundColor: bgColor },
          headerBackVisible: false,
          headerLeft: FormBackButton,
        }}
      />
      {!isLoading && <FetchingSpinner isFetching={isFetching} />}
    </FormProvider>
  );
}
