import { Boundary, Coordinates, MapRegion, Point, Polygon } from '@lactalink/types';
import getBoundsOfDistance from 'geolib/es/getBoundsOfDistance';
import { GeolibBounds } from 'geolib/es/types';

export function boundsToPolygon(center: Coordinates, radius: number): Polygon | undefined {
  // Get the southwestern and northeastern bounds
  const bounds = getBoundsOfDistance(center, radius);
  console.log('Bounds:', bounds);
  const [southwest, northeast] = bounds;

  if (!southwest || !northeast) {
    return;
  }

  // Construct the GeoJSON Polygon
  return {
    type: 'Polygon',
    coordinates: [
      [
        [southwest.latitude, southwest.longitude], // Bottom-left (southwest)
        [southwest.latitude, northeast.longitude], // Top-left
        [northeast.latitude, northeast.longitude], // Top-right (northeast)
        [northeast.latitude, southwest.longitude], // Bottom-right
        [southwest.latitude, southwest.longitude], // Close the polygon (back to bottom-left)
      ],
    ],
  };
}

export function regionToBoundary(region: MapRegion): Boundary {
  const latMin = region.latitude - region.latitudeDelta / 2;
  const latMax = region.latitude + region.latitudeDelta / 2;
  const lngMin = region.longitude - region.longitudeDelta / 2;
  const lngMax = region.longitude + region.longitudeDelta / 2;

  return {
    minX: lngMin,
    minY: latMin,
    maxX: lngMax,
    maxY: latMax,
  };
}

export function boundaryToLatLngBounds(boundary: GeolibBounds): {
  northeast: Coordinates;
  southwest: Coordinates;
} {
  return {
    northeast: { latitude: boundary.maxLat, longitude: boundary.maxLng },
    southwest: { latitude: boundary.minLat, longitude: boundary.minLng },
  };
}

/**
 * Converts a Coordinates object to a GeoJSON Point. If the coordinates are invalid, returns [0, 0].
 * @param coordinates An object with latitude and longitude properties
 * @returns A GeoJSON Point represented as [longitude, latitude]
 */
export function latLngToPoint<T extends Coordinates | undefined | null>(coordinates: T): Point {
  if (!coordinates) {
    return [0, 0];
  }

  const { latitude, longitude } = coordinates;
  return [longitude, latitude];
}

/**
 * Converts a GeoJSON Point to a Coordinates object. If the point is undefined or null, returns { latitude: 0, longitude: 0 }.
 * @param point A GeoJSON Point represented as [longitude, latitude]
 * @returns An object with latitude and longitude properties
 */
export function pointToLatLng<T extends Point | undefined | null>(point: T): Coordinates {
  if (!point) {
    return { latitude: 0, longitude: 0 };
  }

  const [longitude, latitude] = point;
  return { latitude, longitude };
}
