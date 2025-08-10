/**
 * A function type that extracts geographic coordinates from an item of type `T`.
 *
 * @template T - The type of the item from which to extract coordinates.
 * @param item - The item to extract the latitude and longitude from.
 * @returns An object containing x and y properties as numbers.
 */
export type PointExtractor<T> = (item: T) => { x: number; y: number };

export interface IndexedData<T> {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  data: T;
}
