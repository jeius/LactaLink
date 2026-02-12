import { Coordinates, Point } from '@lactalink/types';
import { Collection } from '@lactalink/types/collections';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import { isValidCoordinate } from '@lactalink/utilities/geolib';

export function createMarkerID<TSlug extends CollectionSlug>(
  slug: TSlug,
  id: Collection<TSlug>['id'],
  point: Point | Coordinates
) {
  const { latitude, longitude } = Array.isArray(point) ? pointToLatLng(point) : point;
  return `${slug}-${id}-[${longitude},${latitude}]`;
}

export function parseMarkerID(markerID: string): {
  slug: CollectionSlug;
  id: string;
  coordinates: Coordinates;
} | null {
  const parts = markerID.split('-');
  if (parts.length < 3) {
    console.warn(`Invalid markerID format: ${markerID}`);
    return null;
  }

  const slug = parts[0] as CollectionSlug;
  const id = parts.slice(1, parts.length - 1).join('-');
  const coordPart = parts[parts.length - 1]!;

  const match = coordPart.match(/\[([-+]?[0-9]*\.?[0-9]+),([-+]?[0-9]*\.?[0-9]+)\]/);
  if (!match) {
    console.warn(`Invalid coordinates format in markerID: ${markerID}`);
    return null;
  }

  const longitude = parseFloat(match[1] ?? '0');
  const latitude = parseFloat(match[2] ?? '0');
  const coordinates: Coordinates = { latitude, longitude };

  if (!isValidCoordinate(coordinates)) {
    console.warn(`Invalid coordinate values in markerID: ${markerID}`);
    return null;
  }

  return { slug, id, coordinates };
}
