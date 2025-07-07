import { BACK_TOAST_ID } from '@/lib/constants';
import { useRouter } from 'expo-router';
import { ArrowLeftIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { toast } from 'sonner-native';
import { Button, ButtonIcon, ButtonText } from './ui/button';

interface HeaderBackButtonProps {
  disable: boolean;
  message: string;
}

export function HeaderBackButton({
  disable,
  message = 'Unable to go back.',
}: HeaderBackButtonProps) {
  const router = useRouter();
  const canGoBack = router.canGoBack();

  const [toastDuration, setToastDuration] = useState<number>();

  useEffect(() => {
    if (disable) {
      setToastDuration(Infinity);
    } else {
      setToastDuration(undefined);
      toast.dismiss(BACK_TOAST_ID);
    }
  }, [disable]);

  function handleBackPress() {
    if (!disable) {
      router.back();
    } else {
      toast.warning(message, {
        id: BACK_TOAST_ID,
        action: <BackToastAction />,
        duration: toastDuration,
      });
    }
  }

  function BackToastAction() {
    function handleLeave() {
      router.back();
      toast.dismiss(BACK_TOAST_ID);
    }

    return (
      <Button size="sm" action="secondary" onPress={handleLeave}>
        <ButtonText>Leave Anyway</ButtonText>
      </Button>
    );
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
