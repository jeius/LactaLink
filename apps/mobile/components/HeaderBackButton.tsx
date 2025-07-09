import { BACK_TOAST_ID } from '@/lib/constants';
import { useRouter } from 'expo-router';
import { ChevronLeftIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { GestureResponderEvent } from 'react-native';
import { toast } from 'sonner-native';
import { LeaveToastAction } from './toasts/ToastAction';
import { Box } from './ui/box';
import { Button, ButtonIcon } from './ui/button';

interface HeaderBackButtonProps {
  preventBack?: boolean;
  message?: string;
  toastAction?: React.ReactNode;
  toastID?: string;
  onPress?: (event: GestureResponderEvent) => void;
}

export function HeaderBackButton({
  preventBack: disable = false,
  message = 'Are you sure you want to leave?',
  toastAction,
  toastID = BACK_TOAST_ID,
  onPress,
}: HeaderBackButtonProps) {
  const router = useRouter();
  const canGoBack = router.canGoBack();

  useEffect(() => {
    if (!disable) {
      toast.dismiss(toastID);
    }
  }, [disable, toastID]);

  function handleOnPress(event: GestureResponderEvent) {
    if (!disable) {
      router.back();
    } else {
      toast.warning(message, {
        id: toastID,
        action: toastAction || <LeaveToastAction id={toastID} />,
        duration: Infinity,
      });
    }
    onPress?.(event);
  }

  if (!canGoBack) {
    return null;
  }

  return (
    <Box className="m-auto">
      <Button
        variant="link"
        action="default"
        className="h-fit w-fit"
        hitSlop={16}
        onPress={handleOnPress}
      >
        <ButtonIcon className="h-6 w-6" as={ChevronLeftIcon} />
      </Button>
    </Box>
  );
}
