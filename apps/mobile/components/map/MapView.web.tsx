import { Box } from '@/components/ui/box';
import React, { PropsWithChildren } from 'react';
import type { ViewProps } from 'react-native';

export type MapViewProps = PropsWithChildren<{
  containerClassName?: string;
  containerStyle?: ViewProps['style'];
}> &
  Record<string, unknown>;

export function MapView({ children, containerClassName, containerStyle }: MapViewProps) {
  return (
    <Box
      style={containerStyle}
      className={containerClassName ?? 'flex-1 items-center justify-center bg-background-100'}
    >
      {children}
    </Box>
  );
}

export default MapView;
