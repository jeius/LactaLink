import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { BasicLocationPin } from '@/components/ui/icon/custom';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { MapPageSearchParams } from '@/lib/types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { EditIcon, XIcon } from 'lucide-react-native';
import React from 'react';

type SearchParams = MapPageSearchParams & { id: string };

export default function ExploreAddressInfo() {
  const { data: meUser } = useMeUser();

  const router = useRouter();
  const params = useLocalSearchParams<SearchParams>();
  const { lat, lng, title, id } = params;

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

  const handleClose = () => {
    router.replace('/map/explore/donations');
  };

  return (
    <Card className="absolute inset-x-4 bottom-4 p-4">
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
                onPress={handleClose}
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
