import { BACK_TOAST_ID } from '@/lib/constants';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { Button, ButtonText } from '../ui/button';
import { HStack } from '../ui/hstack';

interface FormBackToastActionProps {
  onConfirm?: () => void;
  confirmLabel?: string;
  onAbort?: () => void;
  abortLabel?: string;
}
export function FormBackToastAction({
  onConfirm,
  onAbort,
  confirmLabel = 'Leave',
  abortLabel = 'No',
}: FormBackToastActionProps) {
  const router = useRouter();

  function handleLeave() {
    toast.dismiss(BACK_TOAST_ID);
    router.back();
    onConfirm?.();
  }

  function handleCancel() {
    toast.dismiss(BACK_TOAST_ID);
    onAbort?.();
  }

  return (
    <HStack space="md" className="w-full justify-end">
      <Button size="sm" action="default" onPress={handleLeave}>
        <ButtonText>{confirmLabel}</ButtonText>
      </Button>
      <Button size="sm" action="default" variant="outline" onPress={handleCancel}>
        <ButtonText>{abortLabel}</ButtonText>
      </Button>
    </HStack>
  );
}
