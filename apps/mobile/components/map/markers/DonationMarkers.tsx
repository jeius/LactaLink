import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { Image } from '@/components/Image';
import { getHexColor } from '@/lib/colors';
import { STORAGE_TYPES } from '@/lib/constants';

import Avatar from '@/components/Avatar';
import { Box } from '@/components/ui/box';
import { createPolygonFromRegion } from '@/lib/utils/createPolygonFromRegion';
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import {
  Address,
  Avatar as AvatarType,
  DeliveryPreference,
  Donation,
  Individual,
} from '@lactalink/types';
import { isPointInPolygon } from '@lactalink/utilities';
import { useMemo, useState } from 'react';
import { MapMarkerProps, MarkerAnimated, MarkerPressEvent, Region } from 'react-native-maps';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { DefaultMarker } from './DefaultMarker';

type DeliveryDetails = {
  data: Donation;
  deliveryPreference: Omit<DeliveryPreference, 'requests' | 'donors'>;
};

type MarkerDetails = MapMarkerProps & DeliveryDetails;

export type DonationMarkerPressEvent = DeliveryDetails &
  Pick<MapMarkerProps, 'identifier' | 'coordinate' | 'title' | 'description' | 'id'>;

interface DonationMarkersProps {
  data: Donation;
  onPress?: (event: DonationMarkerPressEvent) => void;
  showAvatar?: boolean;
  region?: Region;
}
export function DonationMarkers({
  data,
  onPress,
  showAvatar: showAvatarProp,
  region,
}: DonationMarkersProps) {
  const { theme } = useTheme();
  const pinColor = getHexColor(theme, 'primary', 600);
  const iconBgColor = getHexColor(theme, 'primary', 100);

  const animateValue = useSharedValue({ scale: 1, y: 0 });
  const [showAvatar, setShowAvatar] = useState(showAvatarProp || false);

  const profile = data.donor as Individual;
  const profileAvatar = profile.avatar as AvatarType | null | undefined;

  const markers = useMemo(() => createMarkers(data, region), [data, region]);

  const markerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animateValue.value.scale }, { translateY: animateValue.value.y }],
  }));

  function handleMarkerPress(event: MarkerPressEvent, details: DonationMarkerPressEvent) {
    onPress?.(details);
    animateValue.value = { scale: withSpring(1.2), y: withTiming(-10) };
    setShowAvatar(true);
  }

  return markers.map((marker) => (
    <MarkerAnimated
      {...marker}
      key={marker.identifier}
      onPress={(e) => {
        handleMarkerPress(e, marker);
      }}
      style={markerAnimStyle}
    >
      <Animated.View style={[{ position: 'relative' }]}>
        <DefaultMarker
          size="xl"
          color={pinColor}
          circleColor={iconBgColor}
          circleIcon={
            !showAvatar ? (
              <Box className="flex-1 p-1.5">
                <Image
                  source={getDeliveryPreferenceIcon(marker.deliveryPreference.preferredMode[0]!)}
                  style={{ flex: 1 }}
                />
              </Box>
            ) : (
              profileAvatar && (
                <Avatar
                  className="h-full w-full"
                  details={{ name: profile.displayName || 'Donor', avatar: profileAvatar }}
                />
              )
            )
          }
        />
      </Animated.View>
    </MarkerAnimated>
  ));
}

function createMarkers(data: Donation, region?: Region) {
  const volume = data.remainingVolume || 0;
  const storageType = data.details.storageType;
  const preferences = data.deliveryDetails as DeliveryPreference[];

  const markerList: MarkerDetails[] = [];

  for (const preference of preferences) {
    const address = preference.address as Address;
    const [latitude, longitude] = (address && address.coordinates) || [];

    if (latitude && longitude) {
      const marker: MarkerDetails = {
        id: `donations-${data.id}-delivery-${preference.id}`,
        identifier: `donations-${data.id}-delivery-${preference.id}`,
        coordinate: { latitude, longitude },
        title: data.title || `Donation | ${volume} mL`,
        description: `${volume} mL of ${STORAGE_TYPES[storageType].label} milk available.`,
        data,
        deliveryPreference: preference,
      };

      if (region) {
        const polygon = createPolygonFromRegion(region);

        if (isPointInPolygon({ latitude, longitude }, polygon)) {
          markerList.push(marker);
        }
      } else {
        markerList.push(marker);
      }
    }
  }

  return markerList;
}
