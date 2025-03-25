import { Stack } from "expo-router";

import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

// Import your global CSS file
import "../global.css";
import { ThemeProvider } from "@/components/ui/theme-provider";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <GluestackUIProvider mode="light">
        <Stack />
      </GluestackUIProvider>
    </ThemeProvider>
  );
}
