import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react-native';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Noop } from 'react-hook-form';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Box } from '../ui/box';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Image } from '../ui/image';
import { Pressable } from '../ui/pressable';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

const cardStyle = tva({
  base: 'bg-background-50 min-h-32 max-w-32 rounded-2xl',
  variants: {
    isSelected: {
      true: 'border-primary-500 bg-primary-0 border-2',
    },
  },
});

const containerStyle = tva({
  base: 'relative w-full',
});

export type OptionsCardItem<T = unknown> = {
  label: string;
  value: T;
  image?: {
    alt: string;
    uri: string;
  };
};

export type OptionsCardsProps<T> = {
  items?: OptionsCardItem<T>[];
  onChange?: (val: T) => void;
  value?: T;
  isDisabled?: boolean;
  onBlur?: Noop;
  containerClassName?: string;
};

const SCROLL_AMOUNT = 150;

export function OptionsCards<T>({
  items = [],
  onChange: setValue,
  value: selected,
  isDisabled: disabled,
  containerClassName,
}: OptionsCardsProps<T>) {
  const scrollRef = useRef<ScrollView>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [showScrollLeft, setShowScrollLeft] = useState(false);
  const [showScrollRight, setShowScrollRight] = useState(true);
  const [scrollX, setScrollX] = useState(0);

  const [layoutWidth, setLayoutWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    if (layoutWidth > 0 && contentWidth > 0) {
      setIsScrollable(contentWidth > layoutWidth);
    }
  }, [layoutWidth, contentWidth]);

  function handleSelection(val: T) {
    if (setValue) {
      setValue(val);
    }
  }

  const scrollToLeft = () => {
    scrollRef.current?.scrollTo({
      x: Math.max(0, scrollX - SCROLL_AMOUNT),
      animated: true,
    });
  };

  const scrollToRight = () => {
    scrollRef.current?.scrollTo({
      x: scrollX + SCROLL_AMOUNT,
      animated: true,
    });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;

    const scrollX = contentOffset.x;
    const containerWidth = layoutMeasurement.width;
    const totalWidth = contentSize.width;

    const atStart = scrollX <= 5;
    const atEnd = scrollX + containerWidth >= totalWidth - 5;

    setScrollX(scrollX);
    setShowScrollLeft(!atStart);
    setShowScrollRight(!atEnd);
  };

  return (
    <Box disabled={disabled} className={containerStyle({ className: containerClassName })}>
      <ScrollView
        ref={scrollRef}
        horizontal
        alwaysBounceHorizontal
        enabled={!disabled}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onLayout={(e) => {
          const lw = e.nativeEvent.layout.width;
          setLayoutWidth(lw);
          setIsScrollable(contentWidth > lw);
        }}
        onContentSizeChange={(w) => {
          setContentWidth(w);
          setIsScrollable(w > layoutWidth);
        }}
      >
        <HStack space="sm" className="items-center py-1">
          {items.map(({ label, image, value }, i) => (
            <AnimatedScaleWrapper key={i} isSelected={selected === value}>
              <Pressable onPress={() => handleSelection(value)}>
                <Card
                  size="md"
                  className={cardStyle({ isSelected: selected === value })}
                  style={{
                    // maxWidth: 105,
                    minHeight: 115,
                    minWidth: 100,
                  }}
                >
                  <VStack space="md" className="m-auto items-center">
                    <Text size="sm" className="font-JakartaMedium">
                      {label}
                    </Text>
                    {image && <Image alt={image.alt} source={image.uri} size="sm" />}
                  </VStack>
                </Card>
              </Pressable>
            </AnimatedScaleWrapper>
          ))}
        </HStack>
      </ScrollView>

      {isScrollable && showScrollRight && (
        <Pressable
          onPress={scrollToRight}
          className="absolute inset-y-0 right-0 z-10 justify-center px-1"
        >
          <Text className="bg-primary-50 rounded px-1 py-2 shadow-md">
            <Icon as={ChevronsRightIcon} size="sm" />
          </Text>
        </Pressable>
      )}

      {isScrollable && showScrollLeft && (
        <Pressable
          onPress={scrollToLeft}
          className="absolute inset-y-0 left-0 z-10 justify-center px-1"
        >
          <Text className="bg-primary-50 rounded px-1 py-2 shadow-md">
            <Icon as={ChevronsLeftIcon} size="sm" />
          </Text>
        </Pressable>
      )}
    </Box>
  );
}

function AnimatedScaleWrapper({
  children,
  isSelected,
}: {
  children: ReactNode;
  isSelected: boolean;
}) {
  const animatedScale = useSharedValue(0.9);

  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animatedScale.value }],
  }));

  useEffect(() => {
    if (isSelected) {
      animatedScale.value = withSpring(1);
    } else {
      animatedScale.value = withSpring(0.9);
    }
  });

  return <Animated.View style={[animatedScaleStyle]}>{children}</Animated.View>;
}
