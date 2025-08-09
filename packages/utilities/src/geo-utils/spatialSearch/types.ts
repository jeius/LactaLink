import { Point } from '@lactalink/types';
import type RBushTree from 'rbush';

export type RBush<T> = RBushTree<T>;

/**
 * Interface for performing spatial search operations on a collection of items.
 *
 * @typeParam T - The type of items to be indexed and searched.
 */
export interface ISpatialSearch<T> {
  /**
   * Builds a spatial index from an array of items.
   *
   * @param items - The array of items to index.
   * @param pointExtractor - A function that extracts coordinates from an item.
   */
  buildSpatialIndex(items: T[], pointExtractor: PointExtractor<T>): void;

  /**
   * Adds a single item to the spatial index.
   *
   * @param item - The item to add to the index.
   * @param pointExtractor - A function that extracts coordinates from the item.
   */
  addIndexedItem(item: T, pointExtractor: PointExtractor<T>): void;

  /**
   * Searches for items within a specified geographic region.
   *
   * @param region - The region to search within, defined by latitude, longitude, and their deltas.
   * @returns An array of items found within the specified region.
   */
  searchByRegion(region: {
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
  }): T[];
}

/**
 * A function type that extracts geographic coordinates from an item of type `T`.
 *
 * @template T - The type of the item from which to extract coordinates.
 * @param item - The item to extract the latitude and longitude from.
 * @returns An object containing `latitude` and `longitude` properties as numbers.
 */
export type PointExtractor<T> = (item: T) => Point;

export interface IndexedData<T> {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  data: T;
}
