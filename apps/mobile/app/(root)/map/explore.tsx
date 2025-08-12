import { MapBottomSheet } from '@/components/map/MapBottomSheet';
import { Box } from '@/components/ui/box';
import { Input, InputField, InputIcon } from '@/components/ui/input';
import { useIsFocused } from '@react-navigation/native';
import { SearchIcon } from 'lucide-react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Explore() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  return (
    <Box
      style={[{ flex: 1, marginTop: insets.top }]}
      pointerEvents={isFocused ? 'box-none' : 'none'}
    >
      <Box pointerEvents="box-none" className="absolute inset-x-0 top-0 px-5 py-2">
        <Input variant="rounded" className="bg-background-0 shadow-md">
          <InputIcon as={SearchIcon} className="text-primary-500 ml-3" />
          <InputField placeholder="Search donors, requesters, hospitals" />
        </Input>
      </Box>

      <MapBottomSheet />
    </Box>
  );
}
