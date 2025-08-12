import { Box } from '@/components/ui/box';
import { useIsFocused } from '@react-navigation/native';
import React from 'react';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Directions() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  return (
    <Box
      pointerEvents={isFocused ? 'box-none' : 'none'}
      className="flex-1 items-center justify-center"
    >
      <Text>Directions</Text>
    </Box>
  );
}
