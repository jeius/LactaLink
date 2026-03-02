import { useFocusEffect } from 'expo-router';
import { RefObject, useCallback } from 'react';
import { BackHandler } from 'react-native';

export function usePreventBackPress(prevent: boolean | RefObject<boolean>, callBack?: () => void) {
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (typeof prevent === 'boolean' ? prevent : prevent.current) {
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
