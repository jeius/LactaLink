import { useTheme } from '@/components/AppProvider/ThemeProvider';
import Avatar from '@/components/Avatar';
import LocationPin from '@/components/icons/LocationPin';
import { Image } from '@/components/Image';
import { getHexColor } from '@/lib/colors';
import { getIconAsset } from '@/lib/stores';
import {
  Address,
  Avatar as AvatarType,
  DeliveryPreference,
  Individual,
  Request,
} from '@lactalink/types';
import { Asset } from 'expo-asset';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MapMarkerProps, MarkerAnimated, MarkerPressEvent } from 'react-native-maps';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type DeliveryDetails = {
  data: Request;
  deliveryPreference: Omit<DeliveryPreference, 'requests' | 'donors'>;
};

type MarkerDetails = MapMarkerProps & DeliveryDetails;

type OnPressParams = DeliveryDetails &
  Pick<MapMarkerProps, 'identifier' | 'coordinate' | 'title' | 'description' | 'id'>;

interface RequestMarkersProps {
  data: Request;
  onPress?: (value: OnPressParams) => void;
  showAvatar?: boolean;
}
export function RequestMarkers({ data, onPress, showAvatar: showAvatarProp }: RequestMarkersProps) {
  const { theme } = useTheme();
  const pinColor = getHexColor(theme, 'tertiary', 600);
  const iconBgColor = getHexColor(theme, 'tertiary', 50);

  const animateValue = useSharedValue({ scale: 1, y: 0 });
  const [showAvatar, setShowAvatar] = useState(showAvatarProp || false);

  const volume = data.volumeNeeded || 0;
  const preferences = data.deliveryDetails as DeliveryPreference[];

  const profile = data.requester as Individual;
  const profileAvatar = profile.avatar as AvatarType | null | undefined;

  const markers: MarkerDetails[] = [];

  for (const preference of preferences) {
    const address = preference.address as Address;
    const [latitude, longitude] = (address && address.coordinates) || [];

    if (latitude && longitude) {
      const marker: MarkerDetails = {
        id: `request-${data.id}-delivery-${preference.id}`,
        identifier: `request-${data.id}-delivery-${preference.id}`,
        coordinate: { latitude, longitude },
        title: data.title || `Request | ${volume} mL`,
        description: `${volume} mL of milk requested.`,
        data,
        deliveryPreference: preference,
      };
      markers.push(marker);
    }
  }

  const markerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animateValue.value.scale }, { translateY: animateValue.value.y }],
  }));

  function handleMarkerPress(event: MarkerPressEvent, details: OnPressParams) {
    onPress?.(details);
    animateValue.value = { scale: withSpring(1.2), y: withTiming(-10) };
    setShowAvatar(true);
  }

  return markers.map((marker) => (
    <MarkerAnimated
      {...marker}
      key={marker.identifier}
      onPress={(e) => handleMarkerPress(e, marker)}
      style={markerAnimStyle}
    >
      <Animated.View style={[{ position: 'relative' }]}>
        <LocationPin width={56} height={56} fill={pinColor} />
        <View style={[style.circle, { backgroundColor: iconBgColor }]}>
          {!showAvatar && (
            <View style={style.iconContainer}>
              <Image
                source={iconSource[marker.deliveryPreference.preferredMode[0]!]}
                contentFit="contain"
                contentPosition={'center'}
                style={[style.icon]}
              />
            </View>
          )}

          {showAvatar && profileAvatar && (
            <Avatar
              style={style.icon}
              details={{ name: profile.displayName || 'Requester', avatar: profileAvatar }}
            />
          )}
        </View>
      </Animated.View>
    </MarkerAnimated>
  ));
}

const iconSource: Record<DeliveryPreference['preferredMode'][number], Asset> = {
  DELIVERY: getIconAsset('scooterWithBasket'),
  PICKUP: getIconAsset('pickUp'),
  MEETUP: getIconAsset('meetUp'),
};

const iconRadius = 16;

const style = StyleSheet.create({
  icon: {
    width: '100%',
    height: '100%',
  },
  iconContainer: {
    padding: 5,
    width: '100%',
    height: '100%',
  },
  circle: {
    position: 'absolute',
    top: 4,
    left: '50%',
    transform: [{ translateX: -iconRadius }],
    width: iconRadius * 2,
    height: iconRadius * 2,
    borderRadius: iconRadius,
  },
});
