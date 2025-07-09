import { BACK_TOAST_ID } from '@/lib/constants';
import { useRouter } from 'expo-router';
import { ArrowLeftIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner-native';
import { Button, ButtonIcon } from '../ui/button';
import { FormBackToastAction } from './FormBackToastAction';

export function FormBackButton() {
  const router = useRouter();
  const canGoBack = router.canGoBack();

  const message = 'You have unsaved changes. Are you sure you want to leave?';

  const form = useFormContext();
  const disable = form.formState.isDirty;

  useEffect(() => {
    if (!disable) {
      toast.dismiss(BACK_TOAST_ID);
    }
  }, [disable]);

  function handleBackPress() {
    if (!disable) {
      router.back();
    } else {
      toast.warning(message, {
        id: BACK_TOAST_ID,
        action: <FormBackToastAction />,
        duration: Infinity,
      });
    }
  }

  if (!canGoBack) {
    return null;
  }

  return (
    <Button variant="link" action="default" className="h-fit w-fit p-3" onPress={handleBackPress}>
      <ButtonIcon as={ArrowLeftIcon} />
    </Button>
  );
}
