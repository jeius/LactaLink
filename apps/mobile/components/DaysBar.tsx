import { DAYS, ShortDays } from '@lactalink/enums';
import React from 'react';
import { useTheme } from './AppProvider/ThemeProvider';
import { Box } from './ui/box';
import { HStack } from './ui/hstack';
import { Text } from './ui/text';

interface DaysBarProps {
  days: (keyof typeof DAYS)[];
  size?: 'sm' | 'md' | 'lg';
}
export function DaysBar({ days, size = 'sm' }: DaysBarProps) {
  const { themeColors } = useTheme();
  return (
    <HStack className="border-typography-900 w-full overflow-hidden rounded-xl border">
      {Object.keys(ShortDays).map((day, i) => {
        const isLast = i === Object.keys(ShortDays).length - 1;
        const isActive = days.includes(day as keyof typeof DAYS);
        return (
          <Box
            key={`${day}-${i}`}
            className="border-typography-900 flex-1"
            style={{
              borderRightWidth: isLast ? 0 : 1,
              paddingVertical: 6,
              backgroundColor: isActive ? themeColors.primary[300] : 'transparent',
            }}
          >
            <Text size={size} className="font-JakartaMedium text-center">
              {ShortDays[day as keyof typeof ShortDays]}
            </Text>
          </Box>
        );
      })}
    </HStack>
  );
}
