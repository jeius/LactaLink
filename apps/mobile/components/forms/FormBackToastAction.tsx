import { BACK_TOAST_ID } from '@/lib/constants';
import { useRouter } from 'expo-router';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner-native';
import { Button, ButtonText } from '../ui/button';
import { HStack } from '../ui/hstack';

export function FormBackToastAction() {
  const router = useRouter();
  const form = useFormContext();

  function handleLeave() {
    toast.dismiss(BACK_TOAST_ID);
    form.reset();
    router.back();
  }

  function handleCancel() {
    toast.dismiss(BACK_TOAST_ID);
  }

  return (
    <HStack space="md" className="w-full justify-end">
      <Button size="sm" action="default" onPress={handleLeave}>
        <ButtonText>Leave</ButtonText>
      </Button>
      <Button size="sm" action="default" variant="outline" onPress={handleCancel}>
        <ButtonText>No</ButtonText>
      </Button>
    </HStack>
  );
}
