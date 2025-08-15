import { Point } from '@lactalink/types';
import _ from 'lodash';

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

export function arePointsEqual(pointA: Point, pointB: Point): boolean {
  const [lngA, latA] = pointA;
  const [lngB, latB] = pointB;

  const roundedPointA: Point = [parseFloat(lngA.toFixed(4)), parseFloat(latA.toFixed(4))];
  const roundedPointB: Point = [parseFloat(lngB.toFixed(4)), parseFloat(latB.toFixed(4))];

  return _.isEqual(roundedPointA, roundedPointB);
}
