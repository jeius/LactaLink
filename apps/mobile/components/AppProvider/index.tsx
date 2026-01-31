import { BottomSheetModalProvider } from '@/components/ui/bottom-sheet';
import { PressablesConfig } from 'pressto';
import React, { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { Easing } from 'react-native-reanimated';
import { ReactQuery } from './ReactQuery';
import { ThemeProvider } from './ThemeProvider';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ReactQuery>
      <PressablesConfig
        animationType="timing"
        animationConfig={{ duration: 250, easing: Easing.elastic(1.5) }}
        config={{ minScale: 0.98, activeOpacity: 0.6 }}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <ThemeProvider>
              <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
            </ThemeProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </PressablesConfig>
    </ReactQuery>
  );
}
