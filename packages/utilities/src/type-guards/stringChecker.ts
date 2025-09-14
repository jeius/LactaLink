import lodashIsString from 'lodash/isString';

/**
 * Checks if the provided value is an array of strings.
 * @param value - The value to check.
 * @returns - True if the value is an array of strings, false otherwise.
 */
function areStrings(value: unknown[]): value is string[] {
  if (Array.isArray(value) && value.length > 0) {
    return value.every((item) => lodashIsString(item));
  }
  return false;
}

export { areStrings, lodashIsString as isString };
