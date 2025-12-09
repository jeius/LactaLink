import { useFormPreventBack } from '@/hooks/useFormPreventBack';
import { BACK_TOAST_ID } from '@/lib/constants';
import { Stack } from 'expo-router';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { HeaderBackButton } from '../HeaderBackButton';
import { LeaveToastAction } from '../toasts';

export function FormPreventBack() {
  const { formState, reset } = useFormContext();
  useFormPreventBack(<LeaveToastAction id={BACK_TOAST_ID} onConfirm={reset} />);

  const isDirty = formState.isDirty;
  const message = 'You have unsaved changes. Are you sure you want to leave?';

  function headerLeft({ tintColor }: { tintColor?: string }) {
    return (
      <HeaderBackButton
        marginRight={16}
        message={message}
        preventBack={isDirty}
        tintColor={tintColor}
      />
    );
  }

  return <Stack.Screen options={{ headerLeft, headerBackVisible: false }} />;
}
