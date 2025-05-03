import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { LucideIcon, LucideProps } from 'lucide-react-native';
import React, { FC } from 'react';

import { iconStyle, itemStyle } from './style';

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
    <VStack space="lg">
      {items &&
        items.map(({ icon, iconPosition, content, variant }, i) => {
          const isHorizontal = iconPosition === 'left' || iconPosition === 'right';
          const isVertical = iconPosition === 'top' || iconPosition === 'bottom';

          if (isHorizontal)
            return (
              <HStack
                key={i}
                space="sm"
                className="items-center"
                reversed={iconPosition === 'right'}
              >
                {icon && <Icon as={icon} size="xl" className={iconStyle({ variant })} />}
                <Text className={itemStyle({ variant })}>{content}</Text>
              </HStack>
            );
          else if (isVertical)
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
    </VStack>
  );
}
