/**
 * Delays the execution of code for a specified amount of time.
 *
 * This utility function creates a promise that resolves after the specified
 * number of milliseconds. It can be used to introduce delays in asynchronous
 * code, such as waiting before retrying a request or simulating network latency.
 *
 * @param ms - The number of milliseconds to delay.
 * @returns A promise that resolves after the specified delay.
 *
 * @example
 * ```typescript
 * // Wait for 2 seconds before executing the next line
 * await delay(2000);
 * console.log('2 seconds have passed');
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
