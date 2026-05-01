import { DONATION_PIN, HOSPITAL_PIN, MILK_BANK_PIN, REQUEST_PIN } from '@/lib/constants/markerSvgs';
import { getCurrentCoordinates } from '@/lib/stores/locationStore';
import { createMarkerId, createMarkerID } from '@/lib/utils/markerUtils';
import { Donation, Hospital, MilkBank, Request } from '@lactalink/types/payload-generated-types';
import { displayVolume } from '@lactalink/utilities';
import { getDistance } from '@lactalink/utilities/geolib';
import { isDonation, isRequest } from '@lactalink/utilities/type-guards';
import { RNMarker } from 'react-native-google-maps-plus';
import { DataMarker, MapMarker } from '../types';

export type MarkersAction = {
  /** New or updated markers to merge into the accumulated map. */
  add: Map<string, DataMarker>;
  /**
   * IDs of markers that were present in the previous fetch for this viewport
   * but are now absent (deleted server-side).
   */
  remove: Set<string>;
};

const ICON_SIZE = 48;

const MARKER_SVG: Record<MapMarker['type'], string> = {
  donations: DONATION_PIN,
  requests: REQUEST_PIN,
  hospitals: HOSPITAL_PIN,
  milkBanks: MILK_BANK_PIN,
};

export function createMarkerSnippet(doc: Hospital | MilkBank | Donation | Request): string {
  if (isDonation(doc)) {
    const { remainingVolume } = doc;
    return `${displayVolume(remainingVolume)} available`;
  }
  if (isRequest(doc)) {
    const { volumeNeeded } = doc;
    return `${displayVolume(volumeNeeded)} needed`;
  }

  const { totalVolume } = doc;
  return totalVolume ? `${displayVolume(totalVolume)} in stock` : 'Out of stock';
}

/**
 * Converts a lightweight `MapMarker` payload from the `/api/map-markers` endpoint
 * into a renderable `RNMarker` for the Google Maps component.
 *
 * The marker ID is produced by {@link createMarkerID} to keep the same format as
 * the legacy implementation (`{slug}-{id}-[{lng},{lat}]`), ensuring tap-handler
 * compatibility.
 *
 * @param marker - The `MapMarker` payload to convert.
 * @returns A fully-formed `RNMarker` ready for the map.
 */
export function mapMarkerToRNMarker(marker: MapMarker): RNMarker {
  const { id, type, coordinate, title, snippet } = marker;
  const svgString = MARKER_SVG[type];

  const markerID = createMarkerId({ relationTo: type, value: id }, coordinate);

  return {
    id: markerID,
    coordinate,
    title,
    snippet,
    iconSvg: { height: ICON_SIZE, width: ICON_SIZE, svgString },
    anchor: { x: 0.32, y: 1 },
    infoWindowAnchor: { x: 0.32, y: 0 },
  };
}

export function markersReducer(
  prev: Map<string, DataMarker>,
  { add, remove }: MarkersAction
): Map<string, DataMarker> {
  const next = new Map(prev);

  // Evict markers that disappeared from the last fetch for their viewport.
  remove.forEach((id) => next.delete(id));

  // Merge new/updated markers.
  add.forEach((value, key) => next.set(key, value));

  // Sort markers by distance to current location so that nearby markers are
  // more likely to be visible if the total number exceeds the map's marker limit.
  const currentCoords = getCurrentCoordinates();
  if (!currentCoords) return next;

  const sortedEntries = Array.from(next.entries()).sort((a, b) => {
    const distA = getDistance(currentCoords, a[1].marker.coordinate);
    const distB = getDistance(currentCoords, b[1].marker.coordinate);
    return distA - distB;
  });

  return new Map(sortedEntries);
}
