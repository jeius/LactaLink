import { AnimatedProgress } from '@/components/animated/progress';
import { Form } from '@/components/contexts/FormProvider';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useIdentityVerificationForm } from '@/hooks/forms/useIdentityVerificationForm';
import { usePagination } from '@/hooks/forms/usePagination';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { getColor } from '@/lib/colors/getColor';
import { Stack } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IDVerificationLayout() {
  const screenOptions = useScreenOptions();

  const methods = useIdentityVerificationForm();
  const submitSuccess = methods.formState.isSubmitSuccessful;

  return (
    <Form {...methods}>
      <Stack
        initialRouteName="index"
        screenOptions={{
          ...screenOptions,
          headerLeft: ({ tintColor }) => <HeaderBackButton tintColor={tintColor} />,
        }}
      >
        <Stack.Screen
          name="verify-face"
          options={{ headerShown: true, headerTitle: 'Face Verification' }}
        />

        <Stack.Protected guard={!submitSuccess}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen
            name="(form-steps)"
            options={{
              headerShown: true,
              header: () => <FormStepsHeader />,
            }}
          />
        </Stack.Protected>
      </Stack>
    </Form>
  );
}

const STEPS = [
  '/id-verification/id-type',
  '/id-verification/personal-info',
  '/id-verification/id-details',
  '/id-verification/review',
];

function FormStepsHeader() {
  const inset = useSafeAreaInsets();
  const { progress } = usePagination(STEPS);
  const tintColor = getColor('primary', '0');
  const trackColor = getColor('primary', '600');

  return (
    <VStack className="bg-primary-500" style={{ paddingTop: inset.top + 4 }}>
      <HStack className="items-center p-2">
        <HeaderBackButton tintColor={tintColor} style={{ marginLeft: 4 }} />
        <Text className="font-JakartaSemiBold" style={{ color: tintColor }}>
          Verification Form
        </Text>
      </HStack>
      <AnimatedProgress
        size="xs"
        className="bg-primary-100"
        value={progress}
        trackColor={trackColor}
      />
    </VStack>
  );
}
