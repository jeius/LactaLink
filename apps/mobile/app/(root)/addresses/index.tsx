import { AddressList } from '@/components/lists';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { Motion } from '@legendapp/motion';
import { useRouter } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ListPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  function handleAddAddress() {
    router.push('/addresses/create');
  }

  return (
    <SafeArea safeTop={false} safeBottom={false}>
      <VStack className="w-full flex-1">
        <AddressList />

        <Motion.View
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'tween', duration: 100 }}
          style={{ width: '100%' }}
        >
          <Box
            className="border-outline-300 bg-background-0 rounded-t-2xl border p-4"
            style={{ paddingBottom: insets.bottom }}
          >
            <Button onPress={handleAddAddress}>
              <ButtonIcon as={PlusIcon} />
              <ButtonText>Add New Address</ButtonText>
            </Button>
          </Box>
        </Motion.View>
      </VStack>
    </SafeArea>
  );
}
