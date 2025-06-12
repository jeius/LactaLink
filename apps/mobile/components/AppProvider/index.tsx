import React, { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ReactQuery } from './ReactQuery';
import { ThemeProvider } from './ThemeProvider';

export default function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ReactQuery>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>{children}</ThemeProvider>
      </GestureHandlerRootView>
    </ReactQuery>
  );
}
