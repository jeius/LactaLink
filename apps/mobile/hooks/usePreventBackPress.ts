import { BACK_TOAST_ID } from '@/lib/constants';
import { useFocusEffect } from 'expo-router';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { toast } from 'sonner-native';

/**
 * Custom hook to prevent back press on Android devices.
 * Displays a warning message when back button is pressed while enabled.
 *
 * @param {boolean} enable - Whether to enable the prevention of back press.
 * @param {string} [message] - The message to display when back press is prevented.
 */
export function usePreventBackPress(
  enable: boolean,
  message: string = 'You cannot go back at this time.',
  action?: ReactNode
) {
  const [toastDuration, setToastDuration] = useState<number>();

  useEffect(() => {
    if (enable) {
      setToastDuration(Infinity);
    } else {
      setToastDuration(undefined);
      toast.dismiss(BACK_TOAST_ID);
    }
  }, [enable]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (enable) {
          toast.warning(message, {
            id: BACK_TOAST_ID,
            action,
            duration: toastDuration,
          });
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [action, enable, message, toastDuration])
  );
}
