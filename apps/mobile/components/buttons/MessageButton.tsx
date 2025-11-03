import { useMeUser } from '@/hooks/auth/useAuth';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { User } from '@lactalink/types/payload-generated-types';
import { MessageCircleIcon, SendIcon } from 'lucide-react-native';
import { Input, InputField, InputIcon, InputProps } from '../ui/input';
import { Pressable, PressableProps } from '../ui/pressable';

const baseStyle = tva({
  base: 'overflow-hidden rounded-xl',
});

interface MessageButtonProps extends PressableProps {
  recipient: User['profile'];
  label?: string;
  size?: InputProps['size'];
}

export function MessageInputButton({
  recipient,
  label = 'Send a message...',
  size = 'md',
  className,
  ...props
}: MessageButtonProps) {
  const { data: meUser } = useMeUser();
  const sender = meUser?.profile;
  return (
    <Pressable {...props} className={baseStyle({ className })}>
      <Input size={size} pointerEvents="none" role="button">
        <InputIcon as={MessageCircleIcon} className="ml-3" />
        <InputField editable={false} placeholder={label} />
        <InputIcon as={SendIcon} className="mr-3" />
      </Input>
    </Pressable>
  );
}
