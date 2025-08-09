import RBushTree from 'rbush';
import { IndexedData, ISpatialSearch, PointExtractor } from './types';

export class SpatialSearch<T> extends RBushTree<IndexedData<T>> implements ISpatialSearch<T> {
  constructor(maxEntries?: number) {
    super(maxEntries);
  }

  buildSpatialIndex(items: T[], pointExtractor: PointExtractor<T>) {
    this.load(
      items.map((item) => {
        const [longitude, latitude] = pointExtractor(item);
        return {
          minX: longitude,
          minY: latitude,
          maxX: longitude,
          maxY: latitude,
          data: item,
        };
      })
    );
  }

  addIndexedItem(item: T, pointExtractor: PointExtractor<T>) {
    const [longitude, latitude] = pointExtractor(item);
    this.insert({
      minX: longitude,
      minY: latitude,
      maxX: longitude,
      maxY: latitude,
      data: item,
    });
  }

  searchByRegion(region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) {
    const latMin = region.latitude - region.latitudeDelta / 2;
    const latMax = region.latitude + region.latitudeDelta / 2;
    const lngMin = region.longitude - region.longitudeDelta / 2;
    const lngMax = region.longitude + region.longitudeDelta / 2;

    return this.search({ minX: lngMin, minY: latMin, maxX: lngMax, maxY: latMax }).map(
      (item) => item.data
    );
  }
}
