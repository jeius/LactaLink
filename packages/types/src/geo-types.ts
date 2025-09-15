import { type Point as PointType } from './schemas/pointSchema';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Longitude = number;
export type Latitude = number;
export type Elevation = number;
export type Point = PointType;
export type Line = PointType[];
export type Polygon = {
  type: 'Polygon';
  coordinates: Line[];
};

export type MapRegion = {
  /**
   * The center latitude of the region.
   */
  latitude: number;
  /**
   * The center longitude of the region.
   */
  longitude: number;
  /**
   * The latitude span (delta) of the region.
   */
  latitudeDelta: number;
  /**
   * The longitude span (delta) of the region.
   */
  longitudeDelta: number;
};

export type Boundary = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};
