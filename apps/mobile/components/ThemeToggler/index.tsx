import { MoonIcon, SunIcon } from 'lucide-react-native';
import React from 'react';
import { useTheme } from '../AppProvider/ThemeProvider';
import { Box } from '../ui/box';
import { Button, ButtonIcon } from '../ui/button';

export default function ThemeToggler() {
  const { theme, toggleTheme } = useTheme();

  const isLight = theme === 'light';

  return (
    <Box className="absolute bottom-10 right-5 z-10">
      <Button size="lg" className="h-fit w-fit rounded-full p-4" onPress={toggleTheme}>
        <ButtonIcon as={isLight ? SunIcon : MoonIcon} size="lg" />
      </Button>
    </Box>
  );
}
