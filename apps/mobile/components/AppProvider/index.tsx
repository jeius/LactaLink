import { BottomSheetModalProvider } from '@/components/ui/bottom-sheet';
import React, { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { ReactQuery } from './ReactQuery';
import { ThemeProvider } from './ThemeProvider';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ReactQuery>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <ThemeProvider>
            <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
          </ThemeProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </ReactQuery>
  );
}
