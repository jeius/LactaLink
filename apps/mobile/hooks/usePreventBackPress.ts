import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { toast } from 'sonner-native';

export function usePreventBackPress(
  enable: boolean,
  message: string = 'You cannot go back at this time.'
) {
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (enable) {
          toast.warning(message);
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [enable, message])
  );
}
