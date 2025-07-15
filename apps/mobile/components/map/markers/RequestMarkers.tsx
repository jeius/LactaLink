import { useTheme } from '@/components/AppProvider/ThemeProvider';
import Avatar from '@/components/Avatar';
import { Image } from '@/components/Image';
import { Box } from '@/components/ui/box';
import { getHexColor } from '@/lib/colors';
import { createPolygonFromRegion } from '@/lib/utils/createPolygonFromRegion';
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import {
  Address,
  Avatar as AvatarType,
  DeliveryPreference,
  Individual,
  Request,
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
  data: Request;
  deliveryPreference: Omit<DeliveryPreference, 'requests' | 'donors'>;
};

type MarkerDetails = MapMarkerProps & DeliveryDetails;

export type RequestMarkerPressEvent = DeliveryDetails &
  Pick<MapMarkerProps, 'identifier' | 'coordinate' | 'title' | 'description' | 'id'>;

interface RequestMarkersProps {
  data: Request;
  onPress?: (event: RequestMarkerPressEvent) => void;
  showAvatar?: boolean;
  region?: Region;
}
export function RequestMarkers({
  data,
  onPress,
  showAvatar: showAvatarProp,
  region,
}: RequestMarkersProps) {
  const { theme } = useTheme();
  const pinColor = getHexColor(theme, 'tertiary', 600);
  const iconBgColor = getHexColor(theme, 'tertiary', 100);

  const [showAvatar, setShowAvatar] = useState(showAvatarProp || false);

  const markerRefs = useRef<Record<string, MapMarker>>({});

  const profile = data.requester as Individual;
  const profileAvatar = profile.avatar as AvatarType | null | undefined;

  const markers = useMemo(() => createMarkers(data, region), [data, region]);

  useEffect(() => {
    if (showAvatarProp !== undefined) {
      setShowAvatar(showAvatarProp);
    }
    redrawMarkers();
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

  function handleMarkerPress(details: RequestMarkerPressEvent) {
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

function createMarkers(data: Request, region?: Region) {
  const volume = data.volumeNeeded || 0;
  const preferences = data.deliveryDetails as DeliveryPreference[];

  const markers: MarkerDetails[] = [];

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
      id: `request-${data.id}-delivery-${preference.id}`,
      identifier: `request-${data.id}-delivery-${preference.id}`,
      coordinate: { latitude, longitude },
      title: data.title || `Request | ${volume} mL`,
      description: `${volume} mL of milk requested.`,
      data,
      deliveryPreference: preference,
    };

    if (region) {
      const polygon = createPolygonFromRegion(region);

      if (isPointInPolygon({ latitude, longitude }, polygon)) {
        markers.push(marker);
      }
    } else {
      markers.push(marker);
    }
  }

  return markers;
}
