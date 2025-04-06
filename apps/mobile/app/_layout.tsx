import { Stack } from 'expo-router';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { ThemeProvider } from '@/components/ui/theme-provider';
import '@/global.css';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <GluestackUIProvider mode="light">
        <Stack />
      </GluestackUIProvider>
    </ThemeProvider>
  );
}
