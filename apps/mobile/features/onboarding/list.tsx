import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { LucideIcon, LucideProps } from 'lucide-react-native';
import React, { FC } from 'react';

import { tva } from '@gluestack-ui/nativewind-utils/tva';

const itemStyle = tva({
  base: 'flex-1 font-JakartaMedium',
  variants: {
    variant: {
      primary: 'text-primary-600',
      secondary: 'text-secondary-500',
      tertiary: 'text-tertiary-600',
      muted: 'text-typography-700',
      destructive: 'text-error-500',
    },
  },
});

const iconStyle = tva({
  base: '',
  variants: {
    variant: {
      primary: 'text-primary-600',
      secondary: 'text-secondary-500',
      tertiary: 'text-tertiary-600',
      muted: 'text-typography-600',
      destructive: 'text-error-500',
    },
  },
});

export type ListProps = {
  items: {
    icon?: FC<LucideProps> | LucideIcon;
    iconPosition?: 'left' | 'right' | 'top' | 'bottom';
    content: string;
    variant: 'primary' | 'secondary' | 'muted' | 'destructive';
  }[];
};

export default function List({ items }: ListProps) {
  return (
    <VStack space="md" className="flex-1">
      {items.map(({ icon, content, variant }, i) => (
        <HStack key={i} space="sm" className="w-full">
          {icon && <Icon as={icon} size="xl" className={iconStyle({ variant })} />}
          <Text className={itemStyle({ variant })}>{content}</Text>
        </HStack>
      ))}
    </VStack>
  );
}
