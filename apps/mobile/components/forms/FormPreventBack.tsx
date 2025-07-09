import { useFormPreventBack } from '@/hooks/useFormPreventBack';
import { BACK_TOAST_ID } from '@/lib/constants';
import { Stack } from 'expo-router';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { HeaderBackButton } from '../HeaderBackButton';
import { LeaveToastAction } from '../toasts';

export default function FormPreventBack() {
  const form = useFormContext();
  useFormPreventBack(<LeaveToastAction id={BACK_TOAST_ID} onConfirm={form.reset} />);

  const isDirty = form.formState.isDirty;

  function headerLeft() {
    return <FormBackButton preventBack={isDirty} />;
  }

  return <Stack.Screen options={{ headerLeft, headerBackVisible: false }} />;
}

export function FormBackButton({ preventBack }: { preventBack?: boolean }) {
  const message = 'You have unsaved changes. Are you sure you want to leave?';

  const form = useFormContext();
  const isDirty = form?.formState?.isDirty;
  const isPreventBack = preventBack !== undefined ? preventBack : isDirty;

  return <HeaderBackButton message={message} preventBack={isPreventBack} />;
}
