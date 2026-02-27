export * from './converters';
export * from './polyline';
export * from './validatePoint';

export function lerpAngle(a: number, b: number, t: number) {
  let diff = ((b - a + 540) % 360) - 180;
  return (a + diff * t + 360) % 360;
}

export function parsePointString(pointStr: string): [number, number] | null {
  const match = pointStr.match(/^\s*\[?\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*\]?\s*$/);
  if (!match || match.length < 4) {
    return null;
  }
  const lat = parseFloat(match[1]!);
  const lng = parseFloat(match[3]!);
  if (isNaN(lat) || isNaN(lng)) {
    return null;
  }
  return [lat, lng];
}
