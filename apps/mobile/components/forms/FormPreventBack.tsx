import { useFormPreventBack } from '@/hooks/useFormPreventBack';
import { BACK_TOAST_ID } from '@/lib/constants';
import { Stack } from 'expo-router';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { LeaveToastAction } from '../toasts';
import { FormBackButton } from './FormBackButton';

export default function FormPreventBack() {
  const form = useFormContext();
  useFormPreventBack(<LeaveToastAction id={BACK_TOAST_ID} onConfirm={form.reset} />);

  const isDirty = form.formState.isDirty;

  function headerLeft() {
    return <FormBackButton preventBack={isDirty} />;
  }

  return <Stack.Screen options={{ headerLeft, headerBackVisible: false }} />;
}
