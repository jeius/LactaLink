import { useFetchById } from '@/hooks/collections/useFetchById';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { getHexColor } from '@/lib/colors';
import { Hospital } from '@lactalink/types';
import { areStrings, extractCollection, extractID, isString } from '@lactalink/utilities';
import { Building2Icon, MapPinIcon, MilkIcon } from 'lucide-react-native';
import React, { ReactNode } from 'react';
import { useTheme } from '../AppProvider/ThemeProvider';
import { Image } from '../Image';
import { Box } from '../ui/box';
import { Card } from '../ui/card';
import { Divider } from '../ui/divider';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

export interface HospitalListCardProps extends React.ComponentProps<typeof Card> {
  data?: string | Hospital;
  isLoading?: boolean;
  action?: ReactNode;
}

export function HospitalListCard({
  data: dataProp,
  isLoading: isLoadingProp,
  action,
  ...props
}: HospitalListCardProps) {
  const { theme } = useTheme();

  const fillColor = getHexColor(theme, 'primary', 50)?.toString();
  const strokeColor = getHexColor(theme, 'primary', 700)?.toString();

  const query = useFetchById(isString(dataProp), {
    id: extractID(dataProp || ''),
    collection: 'hospitals',
    select: { avatar: true, name: true, owner: true, totalVolume: true },
    populate: { users: { addresses: true } },
  });

  const isLoading = isLoadingProp || query.isLoading;
  const data = extractCollection(dataProp) || query.data;

  const name = data?.name;
  const avatar = extractCollection(data?.avatar);
  const totalVolume = data?.totalVolume || 0;
  const imageUrl = avatar?.sizes?.thumbnail?.url || avatar?.url;
  const addresses = extractCollection(data?.owner)?.addresses?.docs || [];

  const getAddressRes = useFetchBySlug(areStrings(addresses), {
    collection: 'addresses',
    where: {
      and: [{ id: { in: extractID(addresses) } }, { isDefault: { equals: true } }],
    },
    select: { displayName: true, coordinates: true, isDefault: true },
  });

  const defaultAddress = getAddressRes.data?.[0] || null;

  if (isLoading) {
    return (
      <Card {...props}>
        <CardSkeleton />
      </Card>
    );
  }

  return (
    <Card {...props}>
      <VStack space="sm" className="items-start justify-start">
        <HStack space="sm" className="w-full items-stretch">
          <Box className="bg-primary-50 aspect-square flex-shrink-0 overflow-hidden rounded-md">
            {imageUrl ? (
              <Image
                recyclingKey={imageUrl}
                source={{ uri: imageUrl }}
                alt="Hospital Image"
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            ) : (
              <Text size="xs" className="my-auto text-center">
                No Image
              </Text>
            )}
          </Box>

          <VStack space="xs" className="min-w-0 flex-1 items-start">
            <HStack space="xs" className="w-full items-center">
              <Icon size="sm" as={Building2Icon} fill={fillColor} stroke={strokeColor} />
              <Text className="font-JakartaSemiBold flex-1" numberOfLines={1} ellipsizeMode="tail">
                {name}
              </Text>
            </HStack>

            <HStack space="xs" className="w-full items-center">
              <Icon size="sm" as={MilkIcon} fill={fillColor} stroke={strokeColor} />
              <Text size="sm" className="flex-1" numberOfLines={1} ellipsizeMode="tail">
                {totalVolume} mL in stock
              </Text>
            </HStack>

            <HStack space="xs" className="w-full items-center">
              <Icon size="sm" as={MapPinIcon} fill={fillColor} stroke={strokeColor} />
              {getAddressRes.isLoading ? (
                <Skeleton variant="circular" className="h-3 w-32" />
              ) : (
                <Text size="sm" className="flex-1" numberOfLines={1} ellipsizeMode="tail">
                  {defaultAddress ? defaultAddress.displayName : 'No Address'}
                </Text>
              )}
            </HStack>
          </VStack>

          {action && (
            <VStack space="sm" className="flex-shrink-0 items-center justify-between">
              {action}
            </VStack>
          )}
        </HStack>

        <Divider />
      </VStack>
    </Card>
  );
}

function CardSkeleton() {
  return (
    <HStack space="sm" className="w-full items-start">
      <Skeleton style={{ width: 92, aspectRatio: 1 }} />

      <VStack space="xs" className="flex-1 items-start">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-16" />
      </VStack>
    </HStack>
  );
}
