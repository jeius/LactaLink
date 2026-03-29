/**
 * Checks if the given error status code corresponds to an AbortError (HTTP 499).
 *
 * @param errorStatus - The HTTP status code to check
 * @returns True if the status code is 499, indicating an AbortError; otherwise, false.
 */
export function isAbortErrorStatus(errorStatus: number): errorStatus is 499 {
  return errorStatus === 499;
}
