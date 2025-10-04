import { MapBottomSheet } from '@/components/bottom-sheets/MapBottomSheet';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { BasicLocationPin } from '@/components/ui/icon/custom';
import { Input, InputField, InputIcon } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { MapPageSearchParams } from '@/lib/types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { AnimatePresence, Motion } from '@legendapp/motion';
import { useIsFocused } from '@react-navigation/native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { EditIcon, SearchIcon, XIcon } from 'lucide-react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Explore() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { adr, ...params } = useLocalSearchParams<MapPageSearchParams>();
  const router = useRouter();

  function handleClose() {
    router.replace({ pathname: '/map/explore', params });
  }

  return (
    <Box
      style={[{ flex: 1, marginTop: insets.top, pointerEvents: isFocused ? 'box-none' : 'none' }]}
    >
      <Box pointerEvents="box-none" className="absolute inset-x-0 top-0 px-5 py-2">
        <Input variant="rounded" className="bg-background-0 shadow-md">
          <InputIcon as={SearchIcon} className="text-primary-500 ml-3" />
          <InputField placeholder="Search donors, requesters, hospitals" />
        </Input>
      </Box>

      <AnimatePresence>
        {adr ? (
          <Motion.View
            key={'address-card'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{ position: 'absolute', width: '100%', bottom: 0, padding: 20 }}
          >
            <AddressCard id={adr} onClose={handleClose} />
          </Motion.View>
        ) : (
          <MapBottomSheet />
        )}
      </AnimatePresence>
    </Box>
  );
}

interface AddressCardProps {
  id: string;
  onClose?: () => void;
}

function AddressCard({ id, onClose }: AddressCardProps) {
  const { data: meUser } = useMeUser();

  const { data: address, isLoading } = useFetchById(!!id, {
    collection: 'addresses',
    id: id || '',
  });

  const street = address?.street || 'Unknown street';
  const brngy = extractCollection(address?.barangay)?.name;
  const city = extractCollection(address?.cityMunicipality)?.name;
  const province = extractCollection(address?.province)?.name;
  const zip = address?.zipCode;
  const isOwner = extractID(meUser) === extractID(address?.owner);

  return (
    <Card className="p-4">
      {isLoading ? (
        <HStack space="sm" className="w-full">
          <Skeleton variant="rounded" className="h-12 w-12" />
          <VStack className="flex-1">
            <Skeleton variant="rounded" className="mb-1 h-4 w-2/3" />
            <Skeleton variant="circular" className="mb-1 h-3 w-full" />
            <Skeleton variant="circular" className="h-3 w-2/3" />
          </VStack>
        </HStack>
      ) : (
        <HStack space="sm" className="w-full">
          <Box className="p-2">
            <Icon as={BasicLocationPin} style={{ width: 32, height: 32 }} />
          </Box>
          <VStack className="flex-1 items-start">
            <HStack space="sm" className="items-start">
              <Text className="font-JakartaMedium grow">{street}</Text>
              <Button
                size="sm"
                variant="link"
                action="default"
                className="h-fit w-fit p-0"
                hitSlop={8}
                onPress={onClose}
              >
                <ButtonIcon as={XIcon} />
              </Button>
            </HStack>

            <Text size="sm" className="text-typography-800">
              {[brngy, city, zip, province].filter(Boolean).join(', ')}
            </Text>

            {isOwner && (
              <Link href={`/addresses/${id}/edit`} asChild>
                <Button size="sm" variant="outline" className="mt-2">
                  <ButtonIcon as={EditIcon} />
                  <ButtonText>Edit Address</ButtonText>
                </Button>
              </Link>
            )}
          </VStack>
        </HStack>
      )}
    </Card>
  );
}
