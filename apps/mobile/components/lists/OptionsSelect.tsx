import { Image } from '@/components/Image';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { ImageSource } from 'expo-image';
import React, { PropsWithChildren } from 'react';
import { FlatListProps, StyleSheet, ViewProps } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { AnimatedPressable } from '../animated/pressable';
import { Box } from '../ui/box';
import { Card } from '../ui/card';
import { Text } from '../ui/text';

const cardStyle = tva({
  base: 'h-40 w-32 items-center justify-center p-4',
  variants: {
    isSelected: {
      true: 'border-2 border-primary-500 bg-primary-0',
    },
  },
});

export type OptionsSelectItemType<T = unknown> = {
  label: string;
  value: T;
  image?: {
    alt: string;
    source: ImageSource | { uri: string };
  };
};

export type OptionsSelectType<T = unknown> = Omit<
  FlatListProps<OptionsSelectItemType<T>>,
  'renderItem' | 'data' | 'onBlur'
> & {
  items: OptionsSelectItemType<T>[];
  itemStyle?: ViewProps['style'];
  itemGap?: number;
};

export interface OptionsSelectProps<T> extends OptionsSelectType<T> {
  onChange?: (val: T) => void;
  value?: T;
  isDisabled?: boolean;
  onBlur?: () => void;
}

export default function OptionsSelect<T>({
  items,
  onChange: setValue,
  value: selected,
  isDisabled: disabled,
  onBlur,
  horizontal = true,
  overScrollMode = 'never',
  showsHorizontalScrollIndicator = false,
  showsVerticalScrollIndicator = false,
  itemStyle,
  itemGap = 6,
  ...props
}: OptionsSelectProps<T>) {
  function handleSelection(val: T) {
    setValue?.(val);
  }
  return (
    <FlatList
      {...props}
      data={items}
      enabled={!disabled}
      horizontal={horizontal}
      overScrollMode={overScrollMode}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      style={[{ opacity: disabled ? 0.5 : 1 }, StyleSheet.flatten(props.style)]}
      contentContainerStyle={[
        { paddingHorizontal: 16, paddingVertical: 8 },
        StyleSheet.flatten(props.contentContainerStyle),
      ]}
      ItemSeparatorComponent={
        props.ItemSeparatorComponent ??
        (() => <Box style={horizontal ? { width: itemGap } : { height: itemGap }} />)
      }
      renderItem={({ item }) => {
        const { label, image, value } = item;
        const isSelected = selected === value;
        return (
          <AnimatedScaleWrapper isSelected={isSelected} onPress={() => handleSelection(value)}>
            <Card size="lg" className={cardStyle({ isSelected })} style={itemStyle}>
              {image && (
                <Image alt={image.alt} source={image.source} style={{ width: 64, height: 64 }} />
              )}
              <Text size="sm" className="mt-2 flex-1 text-center align-middle font-JakartaSemiBold">
                {label}
              </Text>
            </Card>
          </AnimatedScaleWrapper>
        );
      }}
    />
  );
}

function AnimatedScaleWrapper({
  children,
  isSelected,
  onPress,
}: { isSelected: boolean; onPress: () => void } & PropsWithChildren) {
  const animatedScaleStyle = useAnimatedStyle(() => {
    const scale = withSpring(isSelected ? 1 : 0.9, { stiffness: 600, damping: 70 });
    return { transform: [{ scale }] };
  }, [isSelected]);

  return (
    <AnimatedPressable
      disablePressAnimation
      style={[animatedScaleStyle]}
      className={'overflow-hidden rounded-lg'}
      onPress={onPress}
    >
      {children}
    </AnimatedPressable>
  );
}
