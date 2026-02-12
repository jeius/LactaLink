import { HeaderBackButton } from '@/components/HeaderBackButton';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputIcon } from '@/components/ui/input';
import MapListings from '@/features/map/components/MapListings';
import { SearchIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();

  return (
    <Box className="flex-1 justify-between" style={{ paddingTop: insets.top }}>
      <HStack space="sm" className="items-center py-2 pl-3 pr-5">
        <HeaderBackButton />

        <Input variant="rounded" className="flex-1 bg-background-0 shadow">
          <InputIcon as={SearchIcon} className="ml-3" />
          <InputField numberOfLines={1} placeholder="Search here..." />
        </Input>
      </HStack>

      <MapListings />
    </Box>
  );
}
