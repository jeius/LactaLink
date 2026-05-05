import { PACKAGE_MAP_PIN_PINK, USER_MAP_PIN } from '@/lib/constants/markerSvgs';
import { DELIVERY_OPTIONS } from '@lactalink/enums';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractDisplayName } from '@lactalink/utilities/extractors';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import { useMemo } from 'react';
import { RNLatLng, RNMarker, RNMarkerSvg } from 'react-native-google-maps-plus';
import { extractDeliveryDetail } from '../lib/extractors';
import { getOtherParty } from '../lib/getOtherParty';

const DESTINATION_SVG: RNMarkerSvg = { width: 48, height: 48, svgString: PACKAGE_MAP_PIN_PINK };
const OTHER_PARTY_SVG: RNMarkerSvg = { width: 48, height: 48, svgString: USER_MAP_PIN };

/**
 * Returns map markers for the delivery destination and (optionally) the other party's
 * live location, suitable for passing directly to {@link MapView}.
 */
export function useTransactionMapMarkers(
  transaction: Transaction | undefined | null,
  otherPartyLocation: RNLatLng | null
): RNMarker[] {
  return useMemo<RNMarker[]>(() => {
    const markers: RNMarker[] = [];

    if (!transaction) return markers;

    const transactionId = transaction.id;
    const deliveryDetail = extractDeliveryDetail(transaction);

    if (!deliveryDetail) return markers;

    const { method, address } = deliveryDetail;
    const addressDoc = extractCollection(address);
    const coordinates = addressDoc?.coordinates;

    if (coordinates) {
      markers.push({
        id: `destination:${transactionId}`,
        coordinate: pointToLatLng(coordinates),
        title: `${DELIVERY_OPTIONS[method].label} Location`,
        iconSvg: DESTINATION_SVG,
        anchor: { x: 0.32, y: 1 },
        infoWindowAnchor: { x: 0.32, y: 0 },
        zIndex: 1,
        draggable: false,
      });
    }

    if (otherPartyLocation) {
      const otherParty = getOtherParty(transaction);
      const otherPartyName = extractDisplayName({ profile: otherParty });
      markers.push({
        id: `other-party:${transactionId}`,
        coordinate: otherPartyLocation,
        title: otherPartyName,
        iconSvg: OTHER_PARTY_SVG,
        anchor: { x: 0.32, y: 1 },
        infoWindowAnchor: { x: 0.32, y: 0 },
        zIndex: 2,
        draggable: false,
      });
    }

    return markers;
  }, [transaction, otherPartyLocation]);
}
