import { Box } from '@/components/ui/box';
import { Pressable } from '@/components/ui/pressable';
import { Skeleton } from '@/components/ui/skeleton';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Coordinates } from '@lactalink/types';
import React from 'react';
import type { PressableProps } from 'react-native';

const baseStyle = tva({ base: 'relative h-32 w-full bg-background-100' });

interface ThumbnailMapProps extends Pick<PressableProps, 'onPress' | 'disabled' | 'className'> {
  isLoading?: boolean;
  center: Coordinates;
  zoom?: number;
  pitch?: number;
  heading?: number;
}

export function ThumbnailMap({ isLoading, disabled, onPress, className }: ThumbnailMapProps) {
  if (isLoading) return <Skeleton variant="sharp" className={baseStyle({ className })} />;
  return (
    <Box className={baseStyle({ className })}>
      {onPress && <Pressable disabled={disabled} className="grow" onPress={onPress} />}
    </Box>
  );
}
