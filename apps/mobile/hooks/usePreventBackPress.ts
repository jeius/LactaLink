import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';

export function usePreventBackPress(prevent: boolean, callBack?: () => void) {
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (prevent) {
          callBack?.();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [prevent, callBack])
  );
}
