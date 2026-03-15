import { useRouter } from 'expo-router';
import { ComponentProps } from 'react';
import { GestureResponderEvent } from 'react-native';
import { toast } from 'sonner-native';
import { Button, ButtonText } from '../ui/button';
import { HStack } from '../ui/hstack';

type ButtonProps = ComponentProps<typeof Button>;

export interface ToastActionProps {
  id?: string;
  onConfirm?: () => void;
  confirmLabel?: string;
  confirmButtonProps?: ButtonProps;
  onAbort?: () => void;
  abortLabel?: string;
  abortButtonProps?: ButtonProps;
  dismissOnConfirm?: boolean;
  dismissOnAbort?: boolean;
}
export function ToastAction({
  onConfirm,
  onAbort,
  confirmLabel = 'Confirm',
  abortLabel = 'Cancel',
  confirmButtonProps,
  abortButtonProps,
  id,
  dismissOnConfirm = true,
  dismissOnAbort = true,
}: ToastActionProps) {
  function handleConfirm(e: GestureResponderEvent) {
    onConfirm?.();
    confirmButtonProps?.onPress?.(e);
    if (dismissOnConfirm) {
      toast.dismiss(id);
    }
  }

  function handleCancel(e: GestureResponderEvent) {
    onAbort?.();
    abortButtonProps?.onPress?.(e);
    if (dismissOnAbort) {
      toast.dismiss(id);
    }
  }

  return (
    <HStack space="md" className="w-full justify-end">
      <Button
        {...confirmButtonProps}
        size={confirmButtonProps?.size || 'sm'}
        action={confirmButtonProps?.action || 'default'}
        onPress={handleConfirm}
      >
        <ButtonText>{confirmLabel}</ButtonText>
      </Button>
      <Button
        {...abortButtonProps}
        size={abortButtonProps?.size || 'sm'}
        action={abortButtonProps?.action || 'default'}
        variant={abortButtonProps?.variant || 'outline'}
        onPress={handleCancel}
      >
        <ButtonText>{abortLabel}</ButtonText>
      </Button>
    </HStack>
  );
}

export function LeaveToastAction({
  confirmLabel = 'Leave',
  abortLabel = 'No',
  ...props
}: ToastActionProps) {
  const router = useRouter();

  function handleLeave() {
    router.back();
    props.onConfirm?.();
  }

  function handleAbort() {
    props.onAbort?.();
  }

  return (
    <ToastAction
      {...props}
      onConfirm={handleLeave}
      onAbort={handleAbort}
      confirmLabel={confirmLabel}
      abortLabel={abortLabel}
    />
  );
}

export function CancelToastAction(
  props: { id?: string; label?: string; onCancel?: () => void } & Omit<ButtonProps, 'onPress'>
) {
  const { id, label = 'Cancel', onCancel, action = 'default', size = 'sm', ...buttonProps } = props;

  function handleCancel() {
    onCancel?.();
    toast.dismiss(id);
  }

  return (
    <Button {...buttonProps} action={action} size={size} onPress={handleCancel}>
      <ButtonText>{label}</ButtonText>
    </Button>
  );
}
