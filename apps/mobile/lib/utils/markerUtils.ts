import { Coordinates, Point } from '@lactalink/types';
import { Collection } from '@lactalink/types/collections';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { latLngToPoint, pointToLatLng, validatePoint } from '@lactalink/utilities/geo-utils';

export function createMarkerID<TSlug extends CollectionSlug>(
  slug: TSlug,
  id: Collection<TSlug>['id'],
  point: Point | Coordinates
) {
  const { latitude, longitude } = Array.isArray(point) ? pointToLatLng(point) : point;
  return `${slug}-${id}-[${longitude},${latitude}]`;
}

export function destructureMarkerID(markerID: string): {
  slug: CollectionSlug;
  id: string;
  coordinates: Coordinates;
} {
  const parts = markerID.split('-');
  if (parts.length < 3) {
    throw new Error(`Invalid markerID format: ${markerID}`);
  }

  const slug = parts[0] as CollectionSlug;
  const id = parts.slice(1, parts.length - 1).join('-');
  const coordPart = parts[parts.length - 1]!;
  const match = coordPart.match(/\[([-+]?[0-9]*\.?[0-9]+),([-+]?[0-9]*\.?[0-9]+)\]/);
  if (!match) {
    throw new Error(`Invalid coordinates format in markerID: ${markerID}`);
  }

  const longitude = parseFloat(match[1] ?? '0');
  const latitude = parseFloat(match[2] ?? '0');

  try {
    if (!validatePoint(latLngToPoint({ latitude, longitude }))) {
      throw new Error(`Invalid coordinate values in markerID: ${markerID}`);
    }
  } catch (error) {
    console.error(error);
    throw new Error(`Error validating coordinates in markerID: ${markerID}`);
  }

  return { slug, id, coordinates: { latitude, longitude } };
}
