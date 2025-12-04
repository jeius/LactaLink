/**
 * Formats a given time in seconds into a `minutes:seconds` string format.
 *
 * This utility function takes a total number of seconds and converts it into
 * a human-readable string in the format `MM:SS`. It ensures that the seconds
 * are always displayed as two digits by padding with a leading zero if necessary.
 *
 * @param totalSeconds - The total time in seconds to format.
 * @returns A string representing the formatted time in `MM:SS` format.
 *
 * @example
 * ```typescript
 * const formattedTime = formatTime(125);
 * console.log(formattedTime); // '2:05'
 *
 * const formattedTimeZero = formatTime(60);
 * console.log(formattedTimeZero); // '1:00'
 * ```
 */
export const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Formats a given date to a locale-specific time string.
 * @param date  The date or date string to format.
 * @returns  A formatted time string in 'hh:mm AM/PM' format.
 *
 * @example
 * ```typescript
 * const timeString = formatLocaleTime(new Date('2023-10-05T14:30:00'));
 * console.log(timeString); // '2:30 PM'
 * ```
 */
export function formatLocaleTime(date: Date | string): string {
  const createdDate = new Date(date);

  if (isNaN(createdDate.getTime())) {
    return '';
  }

  return createdDate.toLocaleTimeString('en', {
    timeStyle: 'short',
    hour12: true,
  });
}
