import { useRouter } from 'expo-router';
import { ArrowLeftIcon } from 'lucide-react-native';
import { toast } from 'sonner-native';
import { Button, ButtonIcon } from './ui/button';

interface HeaderBackButtonProps {
  enable?: boolean;
  message?: string;
}

export function HeaderBackButton({
  enable,
  message = 'Unable to go back.',
}: HeaderBackButtonProps) {
  const router = useRouter();
  const canGoBack = router.canGoBack();

  function handleBackPress() {
    if (enable) {
      router.back();
    } else {
      toast.warning(message);
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
