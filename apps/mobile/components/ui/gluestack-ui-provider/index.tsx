import { Toaster } from '@/components/sonner';
import { OverlayProvider } from '@gluestack-ui/overlay';
import React from 'react';
import { View, ViewProps } from 'react-native';
import { Config, config } from './config';
import { ModeType } from './types';

/**
 * GluestackUIProvider sets up theming and global UI context for the app.
 *
 * - Applies the selected color mode (light/dark) using the config.
 * - Renders the Toaster at the top level to provide global toast and overlay support.
 * - Children are rendered inside an absolutely positioned View below the Toaster,
 *   ensuring that the Toaster is always rendered above the children and respects safe area insets.
 *
 * Note: The children must be positioned absolute below the Toaster so that toasts and overlays
 * are always visible on top of the app content, and safe area insets are respected.
 */
export function GluestackUIProvider({
  mode = 'light',
  ...props
}: {
  mode?: ModeType;
  children?: React.ReactNode;
  style?: ViewProps['style'];
}) {
  return (
    <View className="relative flex-1" style={[config[mode as keyof Config], props.style]}>
      <OverlayProvider>
        <View className="absolute inset-0">{props.children}</View>
      </OverlayProvider>

      <Toaster />
    </View>
  );
}
