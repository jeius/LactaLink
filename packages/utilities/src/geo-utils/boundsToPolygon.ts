import { Coordinates, Polygon } from '@lactalink/types';
import { getBoundsOfDistance } from 'geolib';

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
