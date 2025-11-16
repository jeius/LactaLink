import { useRecyclingState } from '@shopify/flash-list';
import React, { ReactNode, useCallback, useEffect } from 'react';
import { TextLayoutEvent } from 'react-native';
import { Pressable } from '../pressable';
import { Text, TextProps } from '../text';
import { VStack } from '../vstack';

interface TruncatedTextProps extends TextProps {
  children: ReactNode;
  initialLines?: number;
  showToggle?: boolean;
  expandLabel?: string;
  collapseLabel?: string;
  recyclingKey?: string | number;
}

export function TruncatedText({
  children,
  initialLines = 3,
  showToggle = true,
  expandLabel = '—See more',
  collapseLabel = '—See less',
  recyclingKey,
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
    <VStack className="items-start">
      <Text
        {...textProps}
        onTextLayout={onTextLayout}
        numberOfLines={mounted && !expanded ? initialLines : undefined}
      >
        {children}
      </Text>
      {showToggle && isTruncated && (
        <Pressable onPress={() => setExpanded(!expanded)}>
          <Text size="sm" className="font-JakartaSemiBold">
            {expanded ? collapseLabel : expandLabel}
          </Text>
        </Pressable>
      )}
    </VStack>
  );
}
