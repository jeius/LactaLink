import { useFetchById } from '@/hooks/collections/useFetchById';
import { getHexColor } from '@/lib/colors';
import { useLocationStore } from '@/lib/stores/locationStore';
import { Address, Hospital } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID, extractImageData } from '@lactalink/utilities/extractors';
import { convertDistance, getDistance } from '@lactalink/utilities/geolib';
import { isString } from '@lactalink/utilities/type-guards';
import { Building2Icon, MapPinIcon, MilkIcon } from 'lucide-react-native';
import { ComponentProps, ReactNode, useMemo } from 'react';
import { useTheme } from '../AppProvider/ThemeProvider';
import { BasicBadge } from '../badges';
import { SingleImageViewer } from '../ImageViewer';
import { Box } from '../ui/box';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

export interface HospitalListCardProps extends ComponentProps<typeof Card> {
  data?: string | Hospital;
  isLoading?: boolean;
  action?: ReactNode;
  address?: string | Address;
  canViewThumbnail?: boolean;
}

export function HospitalListCard({
  data: dataProp,
  isLoading: isLoadingProp,
  action,
  address: addressProp,
  canViewThumbnail = true,
  ...props
}: HospitalListCardProps) {
  const { theme } = useTheme();

  const fillColor = getHexColor(theme, 'primary', 50)?.toString();
  const strokeColor = getHexColor(theme, 'primary', 700)?.toString();

  const currentCoords = useLocationStore((s) => s.coordinates);

  const dataQuery = useFetchById(isString(dataProp), {
    id: extractID(dataProp || ''),
    collection: 'hospitals',
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
  const avatar = extractCollection(data?.avatar);
  const totalVolume = data?.totalVolume || 0;
  const image = extractImageData(avatar);

  const addresses = extractCollection(data?.owner)?.addresses?.docs || [];
  const defaultAddress = extractCollection(addresses)?.find((addr) => addr.isDefault) || address;

  const addrCoords = defaultAddress?.coordinates;
  const distance = useMemo(() => {
    if (currentCoords && addrCoords) {
      const dist = getDistance(currentCoords, addrCoords);
      return convertDistance(dist, 'km').toFixed(2) + ' km';
    }
    return 'Unknown km';
  }, [currentCoords, addrCoords]);

  if (isLoading) {
    return (
      <Card {...props}>
        <CardSkeleton />
      </Card>
    );
  }

  return (
    <Card {...props}>
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
            <Icon size="sm" as={MapPinIcon} fill={fillColor} stroke={strokeColor} />
            <Text size="sm" className="flex-1" numberOfLines={1} ellipsizeMode="tail">
              {distance} away
            </Text>
          </HStack>

          <HStack space="xs" className="w-full items-center">
            {totalVolume > 0 ? (
              <>
                <Icon size="sm" as={MilkIcon} fill={fillColor} stroke={strokeColor} />
                <Text size="md" className="flex-1" numberOfLines={1} ellipsizeMode="tail">
                  {totalVolume} mL in stock
                </Text>
              </>
            ) : (
              <BasicBadge size="sm" text="Out of stock" variant="outline" action="muted" />
            )}
          </HStack>
        </VStack>

        {action}
      </HStack>
    </Card>
  );
}

function CardSkeleton() {
  return (
    <HStack space="sm" className="w-full items-stretch">
      <Skeleton className="aspect-square h-auto w-auto" />

      <VStack space="xs" className="flex-1">
        <Skeleton variant="rounded" className="h-6 w-40" />
        <Skeleton variant="circular" className="h-4 w-32" />
        <Skeleton variant="circular" className="h-4 w-32" />
      </VStack>
    </HStack>
  );
}
