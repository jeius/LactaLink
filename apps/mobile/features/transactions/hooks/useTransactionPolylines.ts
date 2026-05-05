import { useDirectionsQuery } from '@/features/directions/hooks/useDirectionsQuery';
import { useNavigationPolyline } from '@/features/map/hooks/useNavigationPolyline';
import { createDirectionsPolyline } from '@/features/map/lib/utils/markerUtils';
import { useMeUser } from '@/hooks/auth/useAuth';
import { getPrimaryColor } from '@/lib/colors';
import { getCurrentCoordinates, useCurrentCoordinates } from '@/lib/stores';
import { Coordinates } from '@lactalink/types';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractCollection } from '@lactalink/utilities/extractors';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import { useEffect, useMemo, useState } from 'react';
import { RNPolyline } from 'react-native-google-maps-plus';
import { extractDeliveryDetail } from '../lib/extractors';

export function useTransactionPolylines({
  transaction,
  otherPartyLocation,
  enabled = true,
}: {
  transaction: Transaction;
  otherPartyLocation?: Coordinates | null;
  enabled?: boolean;
}) {
  const { data: meUser } = useMeUser();
  const meUserProfile = meUser?.profile;

  const myCoords = useCurrentCoordinates();

  const deliveryDetails = useMemo(() => extractDeliveryDetail(transaction), [transaction]);
  const destination = useMemo(() => {
    const point = extractCollection(deliveryDetails?.address)?.coordinates;
    return point ? pointToLatLng(point) : null;
  }, [deliveryDetails]);

  const isMeSender = isEqualProfiles(meUserProfile, transaction.sender);

  const enablePolylines = useMemo(() => {
    const deliveryMethod = deliveryDetails?.method;
    if (deliveryMethod === 'DELIVERY') {
      return { mine: isMeSender, other: !isMeSender };
    } else if (deliveryMethod === 'PICKUP') {
      return { mine: !isMeSender, other: isMeSender };
    } else {
      return { mine: true, other: true };
    }
  }, [deliveryDetails, isMeSender]);

  const { polyline: myPolyline } = usePolylines({
    id: 'my-route',
    userCoordinates: myCoords,
    destination: destination,
    enabled: enabled && enablePolylines.mine,
  });

  const { polyline: otherPartyPolyline } = usePolylines({
    id: 'other-party-route',
    userCoordinates: otherPartyLocation,
    destination: destination,
    enabled: enabled && enablePolylines.other,
    lineColor: getPrimaryColor('600'),
  });

  return {
    polylines: !enabled ? [] : ([myPolyline, otherPartyPolyline].filter(Boolean) as RNPolyline[]),
  };
}

function usePolylines({
  id,
  userCoordinates,
  destination,
  enabled = true,
  lineColor,
}: {
  id: string;
  userCoordinates: Coordinates | null | undefined;
  destination: Coordinates | null | undefined;
  enabled?: boolean;
  lineColor?: string;
}) {
  const [origin, setOrigin] = useState(userCoordinates);

  // Seed origin when userCoordinates first becomes available (e.g. otherPartyLocation
  // starts as null from the Realtime channel and arrives after mount)
  useEffect(() => {
    if (userCoordinates && !origin) {
      setOrigin(userCoordinates);
    }
  }, [userCoordinates, origin]);

  const { data: directions, ...query } = useDirectionsQuery(
    { destination, origin, travelMode: 'DRIVE' },
    { enabled, id }
  );

  const { trimmedPolyline, snappedPosition, isOffRoute, distanceFromRoute } = useNavigationPolyline(
    directions?.polyline,
    userCoordinates,
    enabled
  );

  const polyline = useMemo(() => {
    if (!directions?.polyline || !trimmedPolyline || !trimmedPolyline.length) return undefined;
    const coordinates = snappedPosition ? [snappedPosition, ...trimmedPolyline] : trimmedPolyline;
    return createDirectionsPolyline(coordinates.filter(Boolean), { id: id, color: lineColor });
  }, [directions?.polyline, id, lineColor, snappedPosition, trimmedPolyline]);

  useEffect(() => {
    if (isOffRoute) {
      setOrigin(getCurrentCoordinates());
    }
  }, [isOffRoute]);

  return { polyline, distanceFromRoute, ...query };
}
