import { Boundary } from '@lactalink/types';
import { RNRegion } from 'react-native-google-maps-plus';

export function regionToBoundary({ latLngBounds }: RNRegion): Boundary {
  return {
    minX: latLngBounds.southwest.longitude, // Westernmost longitude (left edge)
    minY: latLngBounds.southwest.latitude, // Southernmost latitude (bottom edge)
    maxX: latLngBounds.northeast.longitude, // Easternmost longitude (right edge)
    maxY: latLngBounds.northeast.latitude, // Northernmost latitude (top edge)
  };
}
