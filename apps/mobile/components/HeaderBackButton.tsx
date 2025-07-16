import { BACK_TOAST_ID } from '@/lib/constants';
import { useRouter } from 'expo-router';
import { ChevronLeftIcon } from 'lucide-react-native';
import { ComponentPropsWithoutRef, useEffect } from 'react';
import { GestureResponderEvent, StyleSheet } from 'react-native';
import { toast } from 'sonner-native';
import { LeaveToastAction } from './toasts/ToastAction';
import { Button, ButtonIcon } from './ui/button';

interface HeaderBackButtonProps extends ComponentPropsWithoutRef<typeof Button> {
  preventBack?: boolean;
  message?: string;
  toastAction?: React.ReactNode;
  toastID?: string;
  canGoBack?: boolean;
  href?: string;
  label?: string;
  tintColor?: string;
}

export function HeaderBackButton({
  preventBack: disable = false,
  message = 'Are you sure you want to leave?',
  toastAction,
  toastID = BACK_TOAST_ID,
  canGoBack: canGoBackProp,
  onPress,
  ...props
}: HeaderBackButtonProps) {
  const router = useRouter();
  const canGoBack = canGoBackProp || router.canGoBack();

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
    <Button
      variant="link"
      action="default"
      className="h-fit w-fit py-1"
      hitSlop={32}
      {...props}
      onPress={handleOnPress}
      style={StyleSheet.flatten([{ paddingLeft: 0, paddingRight: 8 }, props.style])}
    >
      <ButtonIcon className="h-6 w-6" as={ChevronLeftIcon} />
    </Button>
  );
}
