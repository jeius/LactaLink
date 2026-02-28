import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import ScrollView from '@/components/ui/ScrollView';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { LucideIcon, LucideProps } from 'lucide-react-native';
import React, { FC } from 'react';

const itemStyle = tva({
  base: 'flex-1 text-left text-sm',
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
    <ScrollView className="self-stretch" contentContainerClassName="gap-3 grow">
      {items &&
        items.map(({ icon, iconPosition, content, variant }, i) => {
          const isHorizontal = iconPosition === 'left' || iconPosition === 'right';

          if (isHorizontal)
            return (
              <HStack
                key={i}
                space="sm"
                className="items-center"
                reversed={iconPosition === 'right'}
              >
                {icon && (
                  <Icon as={icon} width={24} height={24} className={iconStyle({ variant })} />
                )}
                <Text className={itemStyle({ variant })}>{content}</Text>
              </HStack>
            );
          else
            return (
              <VStack
                key={i}
                space="sm"
                className="items-center"
                reversed={iconPosition === 'bottom'}
              >
                {icon && <Icon as={icon} size="xl" className={iconStyle({ variant })} />}
                <Text className={itemStyle({ variant })}>{content}</Text>
              </VStack>
            );
        })}
    </ScrollView>
  );
}
