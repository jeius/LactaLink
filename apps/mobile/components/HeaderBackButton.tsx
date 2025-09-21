import { BACK_TOAST_ID } from '@/lib/constants';
import { useRouter } from 'expo-router';
import { ArrowLeftIcon } from 'lucide-react-native';
import { ComponentPropsWithoutRef, useEffect } from 'react';
import { GestureResponderEvent, StyleSheet } from 'react-native';
import { toast } from 'sonner-native';
import { AnimatedPressable } from './animated/pressable';
import { LeaveToastAction } from './toasts/ToastAction';
import { Icon } from './ui/icon';

interface HeaderBackButtonProps extends ComponentPropsWithoutRef<typeof AnimatedPressable> {
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
  tintColor,
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
    <AnimatedPressable
      className="h-fit w-fit"
      {...props}
      hitSlop={10}
      onPress={handleOnPress}
      style={StyleSheet.flatten([{ padding: 8, marginRight: 5 }, props.style])}
    >
      <Icon className="h-6 w-6" as={ArrowLeftIcon} color={tintColor} />
    </AnimatedPressable>
  );
}
