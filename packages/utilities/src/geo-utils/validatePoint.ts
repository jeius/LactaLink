import { ValidationErrorNames } from '@lactalink/enums/error-names';
import { Point } from '@lactalink/types';
import isArray from 'lodash/isArray';
import isEqual from 'lodash/isEqual';
import isNumber from 'lodash/isNumber';
import { ValidationError } from '../errors';

export function validatePoint(point: unknown): point is Point {
  if (!isArray(point) || point.length !== 2) {
    throw new ValidationError('Expected an array with two elements [longitude, latitude].', {
      name: ValidationErrorNames.INVALID_FORMAT,
      statusCode: 400,
      statusText: 'Bad Request',
      cause: `Received: ${JSON.stringify(point)}`,
    });
  }

  const [longitude, latitude] = point;

  if (!isNumber(longitude) || !isNumber(latitude)) {
    throw new ValidationError('Both longitude and latitude must be numbers.', {
      name: ValidationErrorNames.INVALID_TYPE,
      statusCode: 400,
      statusText: 'Bad Request',
    });
  }

  if (longitude < -180 || longitude > 180) {
    throw new ValidationError('Longitude must be between -180 and 180.', {
      name: ValidationErrorNames.VALUE_OUT_OF_RANGE,
      statusCode: 400,
      statusText: 'Bad Request',
    });
  }

  if (latitude < -90 || latitude > 90) {
    throw new ValidationError('Latitude must be between -90 and 90.', {
      name: ValidationErrorNames.VALUE_OUT_OF_RANGE,
      statusCode: 400,
      statusText: 'Bad Request',
    });
  }

  return true;
}

export function arePointsEqual(pointA: Point, pointB: Point): boolean {
  const [lngA, latA] = pointA;
  const [lngB, latB] = pointB;

  const roundedPointA: Point = [parseFloat(lngA.toFixed(4)), parseFloat(latA.toFixed(4))];
  const roundedPointB: Point = [parseFloat(lngB.toFixed(4)), parseFloat(latB.toFixed(4))];

  return isEqual(roundedPointA, roundedPointB);
}
