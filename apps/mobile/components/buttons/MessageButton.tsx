import { useMeUser } from '@/hooks/auth/useAuth';
import { User } from '@lactalink/types/payload-generated-types';
import { MessageCircleIcon } from 'lucide-react-native';
import { Button, ButtonIcon, ButtonProps, ButtonText } from '../ui/button';

interface MessageButtonProps extends ButtonProps {
  recipient: User['profile'];
  label?: string | null;
}

export function MessageButton({
  recipient,
  size = 'sm',
  action = 'default',
  variant = 'outline',
  label = 'Message',
  ...props
}: MessageButtonProps) {
  const { data: meUser } = useMeUser();
  const sender = meUser?.profile;
  return (
    <Button {...props} size={size} action={action} variant={variant}>
      <ButtonIcon as={MessageCircleIcon} />
      {label && <ButtonText>{label}</ButtonText>}
    </Button>
  );
}
