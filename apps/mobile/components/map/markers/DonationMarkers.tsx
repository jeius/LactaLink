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
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated } from 'react-native';
import {
  MapMarker,
  MapMarkerProps,
  MarkerAnimated,
  MarkerPressEvent,
  Region,
} from 'react-native-maps';
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

  const markerRefs = useRef<Record<string, MapMarker>>({});

  const [showAvatar, setShowAvatar] = useState(showAvatarProp || false);

  const profile = data.donor as Individual;
  const profileAvatar = profile.avatar as AvatarType | null | undefined;

  const markers = useMemo(() => createMarkers(data, region), [data, region]);

  useEffect(() => {
    if (showAvatarProp !== undefined) {
      setShowAvatar(showAvatarProp);
    }
  }, [showAvatarProp]);

  function createRef(marker: MarkerDetails) {
    return (ref: MapMarker | Animated.LegacyRef<MapMarker> | null) => {
      if (ref) {
        if (ref instanceof MapMarker) {
          markerRefs.current[marker.identifier!] = ref;
        } else {
          delete markerRefs.current[marker.identifier!];
        }
      } else {
        delete markerRefs.current[marker.identifier!];
      }
    };
  }

  function redrawMarkers() {
    for (const marker of Object.values(markerRefs.current)) {
      marker.redraw();
    }
  }

  function handleMarkerPress(details: DonationMarkerPressEvent) {
    return (_event: MarkerPressEvent) => {
      onPress?.(details);
      setShowAvatar(true);
      redrawMarkers();
    };
  }

  return markers.map((marker) => {
    // Validate marker before rendering
    if (
      !marker.coordinate ||
      typeof marker.coordinate.latitude !== 'number' ||
      typeof marker.coordinate.longitude !== 'number' ||
      !marker.identifier
    ) {
      console.warn('Skipping invalid marker:', marker.identifier);
      return null;
    }

    return (
      <MarkerAnimated
        {...marker}
        ref={createRef(marker)}
        key={marker.identifier}
        onPress={handleMarkerPress(marker)}
        tracksViewChanges={false}
      >
        <DefaultMarker
          size="sm"
          color={pinColor}
          circleColor={iconBgColor}
          circleIcon={
            !showAvatar ? (
              <Box className="flex-1 p-0.5">
                <Image
                  source={getDeliveryPreferenceIcon(marker.deliveryPreference.preferredMode[0]!)}
                  style={{ flex: 1 }}
                  transition={{ duration: 0 }}
                  onLoad={() => {
                    markerRefs.current[marker.identifier!]?.redraw();
                  }}
                />
              </Box>
            ) : (
              profileAvatar && (
                <Avatar
                  size="xs"
                  className="h-full w-full"
                  details={{ name: profile.displayName || 'Donor', avatar: profileAvatar }}
                  onLayout={() => {
                    markerRefs.current[marker.identifier!]?.redraw();
                  }}
                  onLoad={() => {
                    markerRefs.current[marker.identifier!]?.redraw();
                  }}
                  fadeDuration={0}
                />
              )
            )
          }
        />
      </MarkerAnimated>
    );
  });
}

function createMarkers(data: Donation, region?: Region) {
  const volume = data.remainingVolume || 0;
  const storageType = data.details.storageType;
  const preferences = data.deliveryDetails as DeliveryPreference[];

  const markerList: MarkerDetails[] = [];

  for (const preference of preferences) {
    const address = preference.address as Address;
    const coordinates = address?.coordinates;

    // Add comprehensive validation
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      continue;
    }

    const [latitude, longitude] = coordinates;

    // Validate coordinate values
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      continue;
    }

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

  return markerList;
}
