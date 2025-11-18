import { Form } from '@/components/contexts/FormProvider';
import FormSaver from '@/components/forms/FormSaver';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { FormStepsHeader, Header } from '@/features/id-verification/components/headers';
import { useIDVerificationForm } from '@/features/id-verification/hooks/useIDVerificationForm';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';
import React from 'react';

export default function IDVerificationLayout() {
  const screenOptions = useScreenOptions();

  const methods = useIDVerificationForm();
  const submitSuccess = methods.formState.isSubmitSuccessful;

  return (
    <Form {...methods}>
      <FormSaver schemaName="identity-create" />
      <Stack
        initialRouteName="index"
        screenOptions={{
          ...screenOptions,
          headerLeft: HeaderBackButton,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: true, header: Header }} />

        <Stack.Screen
          name="verify-face"
          options={{ headerShown: true, headerTitle: 'Face Verification' }}
        />

        <Stack.Protected guard={!submitSuccess}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen
            name="(form-steps)"
            options={{ headerShown: true, header: FormStepsHeader }}
          />
        </Stack.Protected>
      </Stack>
    </Form>
  );
}
