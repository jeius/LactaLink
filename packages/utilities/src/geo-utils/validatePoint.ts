import { Point } from '@lactalink/types';

export function validatePoint(point?: Point | null): point is Point {
  if (!point || !Array.isArray(point) || point.length !== 2) {
    return false;
  }

  const [longitude, latitude] = point;

  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    isNaN(latitude) ||
    isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    false;
  }

  return true;
}
