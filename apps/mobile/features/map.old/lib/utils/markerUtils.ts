import { DONATION_PIN, HOSPITAL_PIN, MILK_BANK_PIN, REQUEST_PIN } from '@/lib/constants/markerSvgs';
import { createMarkerID } from '@/lib/utils/markerUtils';
import { getApiClient } from '@lactalink/api';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { Collection } from '@lactalink/types/collections';
import { Donation, Hospital, MilkBank, Request } from '@lactalink/types/payload-generated-types';
import { Where } from '@lactalink/types/payload-types';
import { displayVolume } from '@lactalink/utilities';
import { extractCollection, extractName } from '@lactalink/utilities/extractors';
import { pointToLatLng, validatePoint } from '@lactalink/utilities/geo-utils';
import { isDonation, isHospital, isMilkBank, isRequest } from '@lactalink/utilities/type-guards';
import { RNMarker } from 'react-native-google-maps-plus';
import { DataMarker, DataMarkerSlug } from '../types';
import { extractCoordsFromDP } from './extractCoordsFromDP';

const ICON_SIZE = 48;

// Extracted repetitive marker creation logic into a reusable function
function createMarker({
  id,
  coordinate,
  title,
  snippet,
  svgString,
}: {
  id: string;
  coordinate: { latitude: number; longitude: number };
  title: string;
  snippet?: string;
  svgString?: string;
}): RNMarker {
  return {
    id,
    coordinate,
    title,
    snippet,
    iconSvg: svgString ? { height: ICON_SIZE, width: ICON_SIZE, svgString } : undefined,
    anchor: svgString ? { x: 0.32, y: 1 } : undefined,
    infoWindowAnchor: svgString ? { x: 0.32, y: 0 } : undefined,
  };
}

function createDataMarkersFromDonationOrRequest(doc: Donation | Request): DataMarker[] {
  const isDonationType = isDonation(doc);
  const slug = isDonationType ? ('donations' as const) : ('requests' as const);
  const name = extractName({
    profile: { relationTo: 'individuals', value: isDonationType ? doc.donor : doc.requester },
  });
  const title = `${isDonationType ? 'Donation' : 'Request'}: ${displayVolume(
    isDonationType ? doc.remainingVolume || 0 : doc.volumeNeeded
  )}`;
  const snippet = `${isDonationType ? 'Donated' : 'Requested'} by ${name}.`;
  const svgString = isDonationType ? DONATION_PIN : REQUEST_PIN;
  const preferences = extractCollection(doc.deliveryPreferences) || [];

  return preferences
    .map((pref) => {
      const coordinate = extractCoordsFromDP(pref);
      if (!coordinate) return null;
      const markerID = createMarkerID(slug, doc.id, coordinate);
      return {
        data: { relationTo: slug, value: doc },
        deliveryPreference: pref,
        marker: createMarker({ id: markerID, coordinate, title, snippet, svgString }),
      };
    })
    .filter((m) => m !== null);
}

function createDataMarkerFromOrgs(doc: Hospital | MilkBank): DataMarker | null {
  const availableVolume = doc.totalVolume || 0;
  const owner = extractCollection(doc.owner);
  const addresses = extractCollection(owner?.addresses?.docs) || [];
  const point = addresses.find((address) => address.isDefault)?.coordinates;
  const svgString = isHospital(doc) ? HOSPITAL_PIN : MILK_BANK_PIN;
  const slug = isHospital(doc) ? 'hospitals' : 'milkBanks';

  if (!validatePoint(point)) return null;

  const coordinate = pointToLatLng(point);
  const markerID = createMarkerID(slug, doc.id, point);

  return {
    data: { relationTo: slug, value: doc },
    deliveryPreference: null,
    marker: createMarker({
      id: markerID,
      coordinate,
      title: doc.name,
      snippet: `${availableVolume} mL of milk available.`,
      svgString,
    }),
  };
}

// Improved null checks and reduced redundancy in `createDataMarkerFromDoc`
function createDataMarkerFromDoc<TSlug extends DataMarkerSlug>(
  doc: Collection<TSlug>
): DataMarker | null | DataMarker[] {
  'worklet';
  if (isDonation(doc) || isRequest(doc)) {
    return createDataMarkersFromDonationOrRequest(doc);
  } else if (isHospital(doc) || isMilkBank(doc)) {
    return createDataMarkerFromOrgs(doc);
  } else {
    console.warn(`Unsupported document type for marker creation.`);
    return null;
  }
}

// Simplified `createDataMarkers` by reusing `createMarker`
function createDataMarkers<TSlug extends DataMarkerSlug>(
  docs: Collection<TSlug>[],
  map: Map<string, DataMarker>
) {
  const markers: RNMarker[] = [];
  const dataMarkers: DataMarker[] = [];

  for (const doc of docs) {
    const dataMarker = createDataMarkerFromDoc(doc);

    if (Array.isArray(dataMarker)) {
      dataMarker.forEach((dm) => {
        map.set(dm.marker.id, dm);
        markers.push(dm.marker);
      });
      dataMarkers.push(...dataMarker);
    } else if (dataMarker) {
      map.set(dataMarker.marker.id, dataMarker);
      markers.push(dataMarker.marker);
      dataMarkers.push(dataMarker);
    }
  }
  return { markers, map, dataMarkers };
}

async function initializeMarkers(oldMap: Map<string, DataMarker>) {
  const map = new Map(oldMap);

  const markers = await Promise.all([
    createMarkers('donations', map),
    createMarkers('requests', map),
    createMarkers('hospitals', map),
    createMarkers('milkBanks', map),
  ]);

  return { markers: markers.flat(), map };
}

async function createMarkers<TSlug extends DataMarkerSlug>(
  slug: TSlug,
  map: Map<string, DataMarker>
) {
  const apiClient = getApiClient();
  let where: Where | undefined;

  if (slug === 'donations' || slug === 'requests') {
    where = { status: { equals: DONATION_REQUEST_STATUS.AVAILABLE.value } };
  }

  const docs = await apiClient.find({
    collection: slug,
    where,
    depth: 5,
    pagination: false,
    populate: {
      addresses: { coordinates: true, displayName: true, isDefault: true, name: true },
      users: { addresses: true },
    },
  });

  return createDataMarkers(docs, map).markers;
}

export {
  createDataMarkerFromDoc,
  createDataMarkerFromOrgs,
  createDataMarkersFromDonationOrRequest,
  initializeMarkers,
};
