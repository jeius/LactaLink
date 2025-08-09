import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { Image } from '@/components/Image';
import { getHexColor } from '@/lib/colors';

import Avatar from '@/components/Avatar';
import { Box } from '@/components/ui/box';
import { ColorsConfig } from '@/lib/types/colors';
import { MarkerDetails, MarkerPressEvent } from '@/lib/types/markers';
import { createMarkers } from '@/lib/utils/createMarkers';
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { Avatar as AvatarType, Donation, Individual, Request } from '@lactalink/types';
import { extractCollection, isDonation } from '@lactalink/utilities';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated } from 'react-native';
import {
  MapMarker,
  MarkerAnimated,
  MarkerPressEvent as RNMarkerPressEvent,
  Region,
} from 'react-native-maps';
import { DefaultMarker } from './DefaultMarker';

interface DataMarkersProps<TData extends Donation | Request> {
  data: TData;
  onPress?: (event: MarkerPressEvent<TData>) => void;
  showAvatar?: boolean;
  region?: Region;
  colorTheme?: keyof ColorsConfig['light'];
}
export function DataMarkers<TData extends Donation | Request>({
  data,
  onPress,
  showAvatar: showAvatarProp,
  region,
  colorTheme = 'primary',
}: DataMarkersProps<TData>) {
  const { theme } = useTheme();
  const pinColor = getHexColor(theme, colorTheme, 600);
  const iconBgColor = getHexColor(theme, colorTheme, 100);

  const markerRefs = useRef<Record<string, MapMarker>>({});

  const [showAvatar, setShowAvatar] = useState(showAvatarProp || false);

  const { profileAvatar, displayName } = useMemo(() => extractor(data), [data]);

  const markers = useMemo(() => createMarkers(data, region), [data, region]);

  useEffect(() => {
    if (showAvatarProp !== undefined) {
      setShowAvatar(showAvatarProp);
    }
  }, [showAvatarProp]);

  function createRef(marker: MarkerDetails<TData>) {
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

  function handleMarkerPress(details: MarkerPressEvent<TData>) {
    return (_event: RNMarkerPressEvent) => {
      onPress?.(details);
      setShowAvatar(true);
      redrawMarkers();
    };
  }

  return markers.map((marker) => {
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
                  details={{ name: displayName, avatar: profileAvatar }}
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

function extractor(data: Donation | Request) {
  let profile: Individual | null;
  let profileAvatar: AvatarType | null;
  let displayName: string = isDonation(data) ? 'Donor' : 'Requester';

  if (isDonation(data)) {
    profile = extractCollection(data.donor);
    profileAvatar = extractCollection(profile?.avatar);
    displayName = profile?.displayName || displayName;
  } else {
    profile = extractCollection(data.requester);
    profileAvatar = extractCollection(profile?.avatar);
    displayName = profile?.displayName || displayName;
  }

  return {
    profile,
    profileAvatar,
    displayName,
  };
}
