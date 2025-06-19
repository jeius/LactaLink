export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Longitude = number;
export type Latitude = number;
export type Elevation = number;
export type Point = [Longitude, Latitude, Elevation?];
export type Line = Point[];
export type Polygon = {
  type: 'Polygon';
  coordinates: Line[];
};
