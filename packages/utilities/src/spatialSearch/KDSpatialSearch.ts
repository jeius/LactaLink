import { Boundary } from '@lactalink/types';
import KDBush from 'kdbush';
import { PointExtractor } from './types';

export class SpatialSearch<T> extends KDBush {
  constructor(
    private items: T[],
    private pointExtractor: PointExtractor<T>
  ) {
    super(items.length);
    this._buildIndex();
  }

  private _buildIndex() {
    for (const item of this.items) {
      const { x, y } = this.pointExtractor(item);
      this.add(x, y);
    }

    this.finish();
  }

  /**
   * Searches for items within a specified boundary.
   *
   * @param boundary The boundary to search within, defined by minX, minY, maxX, and maxY.
   * @returns An array of items found within the specified boundary.
   */
  searchByBoundary(boundary: Boundary): T[] {
    const { minX, minY, maxX, maxY } = boundary;

    return this.range(minX, minY, maxX, maxY)
      .map((i) => this.items[i])
      .filter(Boolean) as T[];
  }

  /**
   * Retrieves all items stored in the spatial search structure.
   * @returns An array of all items.
   */
  getAllItems(): T[] {
    return this.items;
  }

  /**
   * Adds a new item to the spatial search structure.
   * @param item The item to be added.
   */
  addItem(item: T) {
    const { x, y } = this.pointExtractor(item);
    this.items.push(item);
    this.add(x, y);
    this.finish();
  }
}
