import { useFetchById } from '@/hooks/collections/useFetchById';
import { getHexColor } from '@/lib/colors';
import { Address, MilkBank } from '@lactalink/types';
import { extractCollection, extractID, extractImageData, isString } from '@lactalink/utilities';
import { Building2Icon, MapPinIcon, MilkIcon } from 'lucide-react-native';
import React, { ReactNode } from 'react';
import { useTheme } from '../AppProvider/ThemeProvider';
import { SingleImageViewer } from '../ImageViewer';
import { Box } from '../ui/box';
import { Card } from '../ui/card';
import { Divider } from '../ui/divider';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

export interface MilkBankListCardProps extends React.ComponentProps<typeof Card> {
  data?: string | MilkBank;
  address?: string | Address;
  isLoading?: boolean;
  action?: ReactNode;
  canViewThumbnail?: boolean;
}

export function MilkBankListCard({
  data: dataProp,
  isLoading: isLoadingProp,
  action,
  address: addressProp,
  canViewThumbnail = true,
  ...props
}: MilkBankListCardProps) {
  const { theme } = useTheme();

  const fillColor = getHexColor(theme, 'primary', 50)?.toString();
  const strokeColor = getHexColor(theme, 'primary', 700)?.toString();

  const dataQuery = useFetchById(isString(dataProp), {
    id: extractID(dataProp || ''),
    collection: 'milkBanks',
    select: { avatar: true, name: true, owner: true, totalVolume: true },
    populate: { users: { addresses: true } },
  });

  const addressQuery = useFetchById(isString(addressProp), {
    id: extractID(addressProp || ''),
    collection: 'addresses',
    depth: 0,
    select: { displayName: true, coordinates: true, isDefault: true },
  });

  const isLoading = isLoadingProp || dataQuery.isLoading || addressQuery.isLoading;

  const data = extractCollection(dataProp) || dataQuery.data;
  const address = extractCollection(addressProp) || addressQuery.data;

  const name = data?.name;
  const totalVolume = data?.totalVolume || 0;
  const avatar = extractCollection(data?.avatar);
  const image = extractImageData(avatar);

  const addresses = extractCollection(data?.owner)?.addresses?.docs || [];
  const defaultAddress = extractCollection(addresses).find((addr) => addr.isDefault) || address;

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
          <Box
            className="aspect-square flex-shrink-0 overflow-hidden rounded-md"
            style={{ backgroundColor: fillColor }}
          >
            <SingleImageViewer disabled={!canViewThumbnail} image={image} />
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
              <Text size="sm" className="flex-1" numberOfLines={1} ellipsizeMode="tail">
                {defaultAddress ? defaultAddress.displayName : 'No Address'}
              </Text>
            </HStack>
          </VStack>

          {action}
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
