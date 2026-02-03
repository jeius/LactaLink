import { BACK_TOAST_ID } from '@/lib/constants';
import { Stack, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { BackHandler } from 'react-native';
import { toast } from 'sonner-native';
import { HeaderBackButton } from '../HeaderBackButton';
import { LeaveToastAction } from '../toasts';

const showToast = (message: string) =>
  toast.warning(message, {
    id: BACK_TOAST_ID,
    duration: Infinity,
    action: <LeaveToastAction id={BACK_TOAST_ID} />,
  });

const dismissToast = () => toast.dismiss(BACK_TOAST_ID);

export function useFormPreventBack(message: string) {
  const form = useFormContext();
  const disable = form.formState.isDirty;

  useEffect(() => {
    if (!disable) dismissToast();
  }, [disable]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (!disable) return false;
        showToast(message);
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [disable, message])
  );
}

export function FormPreventBack() {
  const { formState } = useFormContext();

  const isDirty = formState.isDirty;
  const message = 'You have unsaved changes. Are you sure you want to leave?';

  useFormPreventBack(message);

  return (
    <Stack.Screen
      options={{
        headerBackVisible: false,
        headerLeft: ({ tintColor }) => (
          <HeaderBackButton
            marginRight={16}
            message={message}
            preventBack={isDirty}
            tintColor={tintColor}
          />
        ),
      }}
    />
  );
}
