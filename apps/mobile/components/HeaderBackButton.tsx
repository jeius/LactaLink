import { BACK_TOAST_ID } from '@/lib/constants';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { useRouter } from 'expo-router';
import { ArrowLeftIcon, ChevronLeftIcon } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { GestureResponderEvent, Platform, StyleSheet } from 'react-native';
import { toast } from 'sonner-native';
import { AnimatedPressable, AnimatedPressableProps } from './animated/pressable';
import { LeaveToastAction } from './toasts/ToastAction';
import { Icon } from './ui/icon';
import { PressableProps } from './ui/pressable';

const baseStyle = tva({
  base: 'h-fit w-fit overflow-hidden rounded-full',
});

interface HeaderBackButtonProps
  extends PressableProps,
    Pick<AnimatedPressableProps, 'disablePressAnimation' | 'disableRipple'> {
  preventBack?: boolean;
  message?: string;
  toastAction?: React.ReactNode;
  toastID?: string;
  canGoBack?: boolean;
  href?: string;
  label?: string;
  tintColor?: string;
  iconType?: 'arrow' | 'chevron';
  marginRight?: number;
}

export function HeaderBackButton({
  preventBack: disable = false,
  message = 'Are you sure you want to leave?',
  toastAction,
  toastID = BACK_TOAST_ID,
  canGoBack: canGoBackProp,
  onPress,
  tintColor,
  iconType = Platform.select({ ios: 'chevron', default: 'arrow' }),
  className,
  disablePressAnimation = true,
  marginRight,
  ...props
}: HeaderBackButtonProps) {
  const router = useRouter();
  const canGoBack = canGoBackProp || router.canGoBack();

  const icon = useMemo(() => {
    switch (iconType) {
      case 'chevron':
        return ChevronLeftIcon;
      case 'arrow':
      default:
        return ArrowLeftIcon;
    }
  }, [iconType]);

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
      {...props}
      disablePressAnimation={disablePressAnimation}
      className={baseStyle({ className })}
      hitSlop={10}
      onPress={handleOnPress}
      style={StyleSheet.flatten([{ padding: 8, marginRight }, props.style])}
    >
      <Icon className="h-6 w-6" as={icon} style={{ width: 24, height: 24 }} color={tintColor} />
    </AnimatedPressable>
  );
}
