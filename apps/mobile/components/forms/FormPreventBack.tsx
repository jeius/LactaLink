import { useFormPreventBack } from '@/hooks/useFormPreventBack';
import { BACK_TOAST_ID } from '@/lib/constants';
import { Stack } from 'expo-router';
import React, { ComponentPropsWithoutRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { HeaderBackButton } from '../HeaderBackButton';
import { LeaveToastAction } from '../toasts';

export default function FormPreventBack() {
  const form = useFormContext();
  useFormPreventBack(<LeaveToastAction id={BACK_TOAST_ID} onConfirm={form.reset} />);

  const isDirty = form.formState.isDirty;

  function headerLeft({ tintColor }: { tintColor?: string }) {
    return <FormBackButton preventBack={isDirty} tintColor={tintColor} />;
  }

  return <Stack.Screen options={{ headerLeft, headerBackVisible: false }} />;
}

interface FormBackButtonProps extends ComponentPropsWithoutRef<typeof HeaderBackButton> {
  preventBack?: boolean;
}
export function FormBackButton({ preventBack, ...props }: FormBackButtonProps) {
  const message = 'You have unsaved changes. Are you sure you want to leave?';

  const form = useFormContext();
  const isDirty = form?.formState?.isDirty;
  const isPreventBack = preventBack !== undefined ? preventBack : isDirty;

  return <HeaderBackButton message={message} preventBack={isPreventBack} {...props} />;
}
