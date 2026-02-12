import { AnimatedPressable } from '@/components/animated/pressable';
import { ProfileAvatar } from '@/components/Avatar';
import { SingleImageViewer } from '@/components/ImageViewer';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { getColor } from '@/lib/colors/getColor';
import { ColorCategory } from '@/lib/types/colors';
import { useRouter } from 'expo-router';
import { MapPinIcon } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { MapListingItem, MapListingSlug, MapQueryParams } from '../lib/types';

const colorCategory: Record<MapListingSlug, ColorCategory> = {
  donations: 'primary',
  requests: 'tertiary',
  hospitals: 'secondary',
  milkBanks: 'secondary',
};

interface MapListItemProps {
  item: MapListingItem;
  isFocused?: boolean;
  width: number;
  height: number;
  onPress?: (data: MapListingItem) => void;
}

export default function MapListItem({ item, isFocused, height, width, onPress }: MapListItemProps) {
  const router = useRouter();

  const { coordinates, slug, title, distance, image, user } = item;
  const { latitude: lat, longitude: lng } = coordinates;

  const bgColor = getColor(colorCategory[slug], '600');
  const ringColor = getColor(colorCategory[slug], '500');
  const textColor = getColor(colorCategory[slug], '0');

  useEffect(() => {
    if (isFocused) {
      router.setParams({ lat: lat.toString(), lng: lng.toString() } as MapQueryParams);
    }
  }, [isFocused, lat, lng, router]);

  return (
    <AnimatedPressable
      style={{ width, height }}
      className="justify-between overflow-hidden rounded-2xl shadow-sm"
      onPress={() => onPress?.(item)}
    >
      <Box className="absolute inset-0">
        <SingleImageViewer image={image} disabled />
      </Box>

      {user && (
        <Box
          className="self-start rounded-full border-2"
          style={{ borderColor: ringColor, padding: 1, margin: 8 }}
        >
          <ProfileAvatar size="xs" profile={user} />
        </Box>
      )}

      <HStack space="md" className="items-end p-2">
        <Box className="absolute inset-0" style={{ backgroundColor: bgColor, opacity: 0.65 }} />

        <Text size="md" className="flex-1" bold style={{ color: textColor }}>
          {title}
        </Text>

        {distance && (
          <HStack space="xs" className="items-center">
            <Icon as={MapPinIcon} size="sm" color={textColor} />
            <Text size="xs" style={{ color: textColor }} className="font-JakartaMedium">
              {distance.toFixed(2)} km
            </Text>
          </HStack>
        )}
      </HStack>
    </AnimatedPressable>
  );
}
