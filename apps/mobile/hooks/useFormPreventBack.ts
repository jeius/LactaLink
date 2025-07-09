import { BACK_TOAST_ID } from '@/lib/constants';
import { useFocusEffect } from 'expo-router';
import { ReactNode, useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { BackHandler } from 'react-native';
import { toast } from 'sonner-native';

export function useFormPreventBack(action: ReactNode) {
  const message = 'You have unsaved changes. Are you sure you want to leave?';

  const form = useFormContext();
  const disable = form.formState.isDirty;

  useEffect(() => {
    if (!disable) {
      toast.dismiss(BACK_TOAST_ID);
    }
  }, [disable]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (disable) {
          toast.warning(message, {
            id: BACK_TOAST_ID,
            duration: Infinity,
            action,
          });
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [action, disable])
  );
}
