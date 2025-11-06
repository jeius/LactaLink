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
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedInput = Animated.createAnimatedComponent(Input);

export default function Explore() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { adr, ...params } = useLocalSearchParams<MapPageSearchParams>();
  const router = useRouter();

  const snapPointProgress = useSharedValue(0);

  const animatedHeaderBGStyle = useAnimatedStyle(() => {
    const opacity = interpolate(snapPointProgress.value, [1, 2], [0, 1]);
    return { opacity };
  });

  const animatedInputStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(snapPointProgress.value, [1, 2], [1, 0]);
    return { shadowOpacity };
  });

  function handleClose() {
    router.replace({ pathname: '/map/explore', params });
  }

  return (
    <Box pointerEvents={isFocused ? 'box-none' : 'none'} className="flex-1 flex-col items-stretch">
      <Box pointerEvents="box-none" className="px-5" style={{ paddingTop: insets.top }}>
        <Animated.View className="absolute inset-0 bg-background-0" style={animatedHeaderBGStyle} />
        <AnimatedInput
          variant="rounded"
          className="my-4 bg-background-0 shadow-md"
          style={animatedInputStyle}
        >
          <InputIcon as={SearchIcon} className="ml-3 text-primary-500" />
          <InputField placeholder="Search donors, requesters, hospitals" />
        </AnimatedInput>
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
          <MapBottomSheet snapPointProgress={snapPointProgress} />
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
            <Icon as={BasicLocationPin} className="h-8 w-8 fill-primary-500" />
          </Box>
          <VStack className="flex-1 items-start">
            <HStack space="sm" className="items-start">
              <Text className="grow font-JakartaMedium">{street}</Text>
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
