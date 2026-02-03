import { Coordinates } from '@lactalink/types';
import { isValidLatitude, isValidLongitude } from 'geolib';

type Options<T extends boolean> = {
  throwError?: T;
};

/**
 * Extracts latitude and longitude from a given value. The value is expected to be an object with 'latitude' and 'longitude' properties.
 * @param value The value to extract coordinates from.
 * @param options Optional settings for the extraction process. If 'throwError' is true, the function will throw an error when the value is invalid.
 * @returns `Coordinates` if the value is valid, or `null` if the value is invalid and `throwError` is false.
 */
export function extractCoordinates<T extends boolean = false>(
  value: unknown,
  options: Options<T> = { throwError: false } as Options<T>
): T extends true ? Coordinates : Coordinates | null {
  if (typeof value !== 'object' || value === null || value === undefined) {
    if (options.throwError) {
      throw new Error('Invalid coordinates: Value is not an object.');
    } else {
      return null as T extends true ? Coordinates : Coordinates | null;
    }
  }

  if (!('latitude' in value) || !('longitude' in value)) {
    if (options.throwError) {
      throw new Error('Invalid coordinates: Missing latitude or longitude property.');
    } else {
      return null as T extends true ? Coordinates : Coordinates | null;
    }
  }

  const { latitude, longitude } = value;

  if (!isValidLatitude(latitude)) {
    if (options.throwError) {
      throw new Error(`Invalid coordinates: Latitude ${latitude} is out of range.`);
    } else {
      return null as T extends true ? Coordinates : Coordinates | null;
    }
  }

  if (!isValidLongitude(longitude)) {
    if (options.throwError) {
      throw new Error(`Invalid coordinates: Longitude ${longitude} is out of range.`);
    } else {
      return null as T extends true ? Coordinates : Coordinates | null;
    }
  }

  return { latitude, longitude } as T extends true ? Coordinates : Coordinates | null;
}
