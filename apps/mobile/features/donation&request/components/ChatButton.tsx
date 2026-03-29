import { Button, ButtonIcon, ButtonProps } from '@/components/ui/button';
import { useNavigateToChat } from '@/features/chat/hooks/useNavigateToChat';
import { shadow } from '@/lib/utils/shadows';
import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { User } from '@lactalink/types/payload-generated-types';
import { MessageCircleIcon } from 'lucide-react-native';
import React from 'react';

const styles = tva({
  base: 'h-fit w-fit rounded-full p-3',
});

export default function ChatButton({
  recipient,
  className,
  variant = 'solid',
  action = 'muted',
  ...props
}: { recipient: string | User } & ButtonProps) {
  const navigateToChat = useNavigateToChat(recipient);
  return (
    <Button
      {...props}
      onPress={() => navigateToChat('push')}
      action={action}
      variant={variant}
      className={styles({ className })}
      style={variant === 'solid' ? shadow.sm : undefined}
      aria-label="Send a message"
    >
      <ButtonIcon as={MessageCircleIcon} />
    </Button>
  );
}
