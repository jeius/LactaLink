import { useRecyclingState } from '@shopify/flash-list';
import React, { useCallback, useEffect } from 'react';
import { TextLayoutEvent, ViewProps } from 'react-native';
import { Pressable } from './ui/pressable';
import { Text, TextProps } from './ui/text';

interface TruncatedTextProps extends TextProps {
  initialLines?: number;
  recyclingKey?: string | number;
  containerClassName?: ViewProps['className'];
}

export default function TruncatedText({
  recyclingKey,
  children,
  initialLines = 3,
  containerClassName,
  ...textProps
}: TruncatedTextProps) {
  const key = recyclingKey ?? String(children);

  const [mounted, setMounted] = useRecyclingState(false, [key]);
  const [expanded, setExpanded] = useRecyclingState(false, [key]);
  const [isTruncated, setIsTruncated] = useRecyclingState(false, [key]);

  const onTextLayout = useCallback(
    (e: TextLayoutEvent) => {
      if (!isTruncated && e.nativeEvent.lines.length > initialLines) {
        setIsTruncated(true);
      }
    },
    [isTruncated, setIsTruncated, initialLines]
  );

  useEffect(() => {
    setMounted(true);
  }, [setMounted]);

  return (
    <Pressable
      onPress={() => setExpanded((prev) => !prev)}
      pointerEvents={isTruncated ? 'auto' : 'none'}
      className={containerClassName}
    >
      <Text
        {...textProps}
        onTextLayout={onTextLayout}
        numberOfLines={mounted && !expanded ? initialLines : undefined}
      >
        {children}
      </Text>
    </Pressable>
  );
}
