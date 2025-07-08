import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import { Button, ButtonText } from '@/components/ui/button';
import { useDeliveryPreferenceForm } from '@/hooks/forms';
import { usePreventBackPress } from '@/hooks/usePreventBackPress';
import { getHexColor } from '@/lib/colors';
import { ErrorSearchParams } from '@lactalink/types';
import { Redirect, Stack, useRouter } from 'expo-router';
import React from 'react';
import { FormProvider } from 'react-hook-form';
import { toast } from 'sonner-native';

export default function Layout() {
  const { theme } = useTheme();
  const router = useRouter();

  const headerBgColor = getHexColor(theme, 'background', 0);
  const headerTintColor = getHexColor(theme, 'typography', 900);
  const bgColor = getHexColor(theme, 'background', 50);

  const { form, isLoading, isFetching, error } = useDeliveryPreferenceForm();

  const isFormDirty = form.formState.isDirty;
  const message = 'You have unsaved changes. Please save or reset before leaving.';

  usePreventBackPress(isFormDirty, message, <BackToastAction />);

  function BackToastAction() {
    function handleLeave() {
      form.reset();
      router.back();
      toast.dismiss();
    }

    return (
      <Button size="sm" action="secondary" onPress={handleLeave}>
        <ButtonText>Leave Anyway</ButtonText>
      </Button>
    );
  }

  if (!isLoading && error) {
    const params: ErrorSearchParams = { message: error.message };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  return (
    <FormProvider {...form}>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTitle: 'Create Delivery Preference',
          headerTitleStyle: {
            fontFamily: 'Jakarta-SemiBold',
            fontSize: 16,
          },
          headerStyle: { backgroundColor: headerBgColor?.toString() },
          headerBackButtonDisplayMode: 'minimal',
          headerTintColor: headerTintColor?.toString(),
          contentStyle: { backgroundColor: bgColor },
          headerBackVisible: false,
          headerLeft: () => <HeaderBackButton disable={isFormDirty} message={message} />,
        }}
      />
      {!isLoading && <FetchingSpinner isFetching={isFetching} />}
    </FormProvider>
  );
}
