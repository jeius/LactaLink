import { useFindDirectChat } from '@/features/chat/hooks/queries';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { User } from '@lactalink/types/payload-generated-types';
import { useRouter } from 'expo-router';
import { MessageCircleIcon, SendIcon } from 'lucide-react-native';
import { useCallback } from 'react';
import { Input, InputField, InputIcon, InputProps } from '../ui/input';
import { Pressable, PressableProps } from '../ui/pressable';

const baseStyle = tva({
  base: 'overflow-hidden rounded-xl',
});

interface MessageButtonProps extends PressableProps {
  recipient: string | User;
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
  const router = useRouter();

  const { data: conversation } = useFindDirectChat(recipient);

  const handlePress = useCallback(() => {
    if (conversation) {
      router.push(`/chat/${conversation.id}`);
    }
  }, [router, conversation]);

  if (conversation === null) {
    return null;
  }

  return (
    <Pressable
      {...props}
      disabled={props.disabled ?? !conversation}
      className={baseStyle({ className })}
      onPress={handlePress}
    >
      <Input size={size} pointerEvents="none" role="button">
        <InputIcon as={MessageCircleIcon} className="ml-3" />
        <InputField editable={false} placeholder={label} />
        <InputIcon as={SendIcon} className="mr-3" />
      </Input>
    </Pressable>
  );
}
