import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { Image } from '@/components/Image';
import { getHexColor } from '@/lib/colors';

import { ProfileAvatar } from '@/components/Avatar';
import { Box } from '@/components/ui/box';
import {
  assignMarkerRef,
  MapMarkerProps,
  MarkerData,
  MarkerDataSlug,
  setSelectedMarker,
  useMarkersStore,
} from '@/lib/stores/markersStore';
import { ColorsConfig } from '@/lib/types/colors';
import { MarkerPressEvent } from '@/lib/types/markers';
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { Collection } from '@lactalink/types/collections';
import { Hospital, Individual, MilkBank } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { isDonation, isRequest } from '@lactalink/utilities/type-guards';
import { useEffect, useMemo, useState } from 'react';
import { Animated } from 'react-native';
import {
  MapMarker,
  MarkerAnimated,
  MarkerPressEvent as RNMarkerPressEvent,
} from 'react-native-maps';
import { DefaultMarker } from './DefaultMarker';

interface DataMarkersProps<TSlug extends MarkerDataSlug = MarkerDataSlug> {
  markerData: MarkerData<TSlug>;
  markerProps: MapMarkerProps;
  onPress?: (event: MarkerPressEvent) => void;
  showAvatar?: boolean;
  colorTheme?: keyof ColorsConfig['light'];
}
export function DataMarkers<TSlug extends MarkerDataSlug = MarkerDataSlug>({
  markerProps,
  onPress,
  showAvatar: showAvatarProp,
  colorTheme = 'primary',
  markerData,
}: DataMarkersProps<TSlug>) {
  const { theme } = useTheme();
  const pinColor = getHexColor(theme, colorTheme, 600);
  const iconBgColor = getHexColor(theme, colorTheme, 100);
  const selectedmarker = useMarkersStore((s) => s.selectedMarker)?.marker;

  const [showAvatar, setShowAvatar] = useState(showAvatarProp || false);

  const profile = profileExtractor(markerData?.data);

  const icon = useMemo(() => {
    const iconName = markerData?.deliveryPreference?.preferredMode[0];
    return iconName && getDeliveryPreferenceIcon(iconName);
  }, [markerData?.deliveryPreference?.preferredMode]);

  useEffect(() => {
    if (showAvatarProp !== undefined) {
      setShowAvatar(showAvatarProp);
    }
    redrawMarker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAvatarProp]);

  useEffect(() => {
    if (selectedmarker?.identifier === markerProps.identifier) {
      markerData.markerRef?.showCallout();
      setShowAvatar(true);
    } else {
      markerData.markerRef?.hideCallout();
      setShowAvatar(false);
    }
    redrawMarker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerData.markerRef, selectedmarker?.identifier, markerProps.identifier]);

  function createRef(ref: MapMarker | Animated.LegacyRef<MapMarker> | null) {
    if (ref) {
      if (ref instanceof MapMarker) {
        assignMarkerRef(markerProps.identifier, ref);
      }
    } else {
      assignMarkerRef(markerProps.identifier, ref);
    }
  }

  function redrawMarker() {
    markerData?.markerRef?.redraw();
  }

  function handleMarkerPress(event: RNMarkerPressEvent) {
    onPress?.({ ...event, identifier: markerProps.identifier || event.nativeEvent.id });
    markerProps.onPress?.(event);
    setShowAvatar(true);
    redrawMarker();
    setSelectedMarker(markerProps.identifier);
  }

  return (
    <MarkerAnimated
      {...markerProps}
      ref={createRef}
      onPress={handleMarkerPress}
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
                source={icon}
                style={{ flex: 1 }}
                transition={{ duration: 0 }}
                onLoad={redrawMarker}
              />
            </Box>
          ) : (
            profile && (
              <ProfileAvatar
                size="xs"
                className="h-full w-full"
                profile={profile}
                onLayout={redrawMarker}
                onLoad={redrawMarker}
                fadeDuration={0}
              />
            )
          )
        }
      />
    </MarkerAnimated>
  );
}

function profileExtractor(data: Collection<MarkerDataSlug> | null = null) {
  let profile: Individual | Hospital | MilkBank | null;

  if (!data) return null;

  if (isDonation(data)) {
    profile = extractCollection(data.donor);
  } else if (isRequest(data)) {
    profile = extractCollection(data.requester);
  } else {
    profile = data;
  }

  return profile;
}
