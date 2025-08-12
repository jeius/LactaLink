export {
  convertDistance,
  getBounds,
  getBoundsOfDistance,
  getCenter,
  getCenterOfBounds,
  getDistance,
  getPathLength,
  isPointInPolygon,
} from 'geolib';

export * from './converters';
export * from './spatialSearch';
export * from './validatePoint';

export function lerpAngle(a: number, b: number, t: number) {
  let diff = ((b - a + 540) % 360) - 180;
  return (a + diff * t + 360) % 360;
}
