import { HStack } from '@/components/ui/hstack';
import { shadow } from '@/lib/utils/shadows';
import { LucideIcon } from 'lucide-react-native';
import React, { FC, ReactNode } from 'react';
import { SvgProps } from 'react-native-svg';
import { AnimatedPressable } from '../animated/pressable';
import { Icon } from '../ui/icon';
import { PressableProps } from '../ui/pressable';
import { Text } from '../ui/text';

interface PressableWrapperProps extends PressableProps {
  children?: ReactNode;
  label?: string;
  icon?: LucideIcon | FC<SvgProps>;
}

export default function PressableWrapper({
  label,
  children,
  icon,
  ...props
}: PressableWrapperProps) {
  return (
    <AnimatedPressable {...props} containerStyle={shadow.sm}>
      {children}
      {label && (
        <HStack
          space="xs"
          className="items-center bg-typography-50 p-2"
          style={{ borderBottomLeftRadius: 16, position: 'absolute', top: 0, right: 0 }}
        >
          {icon && <Icon size="sm" as={icon} />}
          <Text size="xs" className="font-JakartaMedium text-typography-700">
            {label}
          </Text>
        </HStack>
      )}
    </AnimatedPressable>
  );
}
