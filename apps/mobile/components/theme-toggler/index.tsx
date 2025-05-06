import { MoonIcon, SunIcon } from 'lucide-react-native';
import React from 'react';
import { useTheme } from '../providers/theme-provider';
import { Box } from '../ui/box';
import { Button, ButtonIcon } from '../ui/button';

export default function ThemeToggler() {
  const { theme, toggleTheme } = useTheme();

  const isLight = theme === 'light';

  return (
    <Box className="absolute right-3 top-10 z-10">
      <Button size="lg" className="rounded-full" onPress={toggleTheme}>
        <ButtonIcon as={isLight ? SunIcon : MoonIcon} size="sm" />
      </Button>
    </Box>
  );
}
