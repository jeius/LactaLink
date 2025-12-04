import { AnimatedPressable } from '@/components/animated/pressable';
import { Icon, IconProps } from '@/components/ui/icon';
import { Link } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import React from 'react';

interface CreateChatButtonProps {
  tintColor?: string;
  size?: IconProps['size'];
}

export default function CreateChatButton({ tintColor, size = 'xl' }: CreateChatButtonProps) {
  return (
    <Link href={'/conversations/create'} push asChild>
      <AnimatedPressable className="overflow-hidden rounded-full p-2">
        <Icon size={size} as={PlusIcon} color={tintColor} />
      </AnimatedPressable>
    </Link>
  );
}
