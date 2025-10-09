import { useTheme } from '@/components/AppProvider/ThemeProvider';

import DonateMilkIcon from '@/components/icons/DonateMilkIcon';
import MilkBottlePlusIcon from '@/components/icons/MilkBottlePlusIcon';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
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
import { isDonation, isHospital, isMilkBank, isRequest } from '@lactalink/utilities/type-guards';
import { Building2Icon, BuildingIcon } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
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
  colorTheme?: keyof ColorsConfig['light'];
}
export function DataMarkers<TSlug extends MarkerDataSlug = MarkerDataSlug>({
  markerProps,
  onPress,
  colorTheme = 'primary',
  markerData,
}: DataMarkersProps<TSlug>) {
  const selectedmarker = useMarkersStore((s) => s.selectedMarker)?.marker;
  const isSelected = selectedmarker?.identifier === markerProps.identifier;

  const { themeColors } = useTheme();
  const pinColor = themeColors[colorTheme][isSelected ? 400 : 600];
  const iconBgColor = themeColors[colorTheme][50];

  const donationRequestIcon = useMemo(() => {
    if (isDonation(markerData.data)) {
      return DonateMilkIcon;
    } else if (isRequest(markerData.data)) {
      return MilkBottlePlusIcon;
    }
    return null;
  }, [markerData?.data]);

  const orgIcon = useMemo(() => {
    if (isHospital(markerData.data)) {
      return Building2Icon;
    } else if (isMilkBank(markerData.data)) {
      return BuildingIcon;
    }
    return null;
  }, [markerData?.data]);

  useEffect(() => {
    if (isSelected) {
      markerData.markerRef?.showCallout();
    } else {
      markerData.markerRef?.hideCallout();
    }
    markerData.markerRef?.redraw();
  }, [isSelected, markerData]);

  function createRef(ref: MapMarker | Animated.LegacyRef<MapMarker> | null) {
    if (ref) {
      if (ref instanceof MapMarker) {
        assignMarkerRef(markerProps.identifier, ref);
      }
    } else {
      assignMarkerRef(markerProps.identifier, ref);
    }
  }

  function handleMarkerPress(event: RNMarkerPressEvent) {
    onPress?.({ ...event, identifier: markerProps.identifier || event.nativeEvent.id });
    markerProps.onPress?.(event);
    setSelectedMarker(markerProps.identifier);
    console.log('Marker pressed:', markerProps.identifier);
  }

  return (
    <MarkerAnimated
      {...markerProps}
      ref={createRef}
      onPress={handleMarkerPress}
      tracksViewChanges={false}
    >
      <DefaultMarker
        size="md"
        color={pinColor}
        circleColor={iconBgColor}
        circleIcon={
          <Box className="flex-1 flex-col items-center justify-center">
            {donationRequestIcon && <Icon size="xs" as={donationRequestIcon} fill={pinColor} />}
            {orgIcon && <Icon size="xs" as={orgIcon} color={pinColor} />}
          </Box>
        }
      />
    </MarkerAnimated>
  );
}
