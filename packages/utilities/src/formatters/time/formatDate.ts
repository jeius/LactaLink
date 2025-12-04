import { MONTHS, MONTHS_SHORT } from './constants';

interface DateOptions {
  /**
   * Use short month names (e.g., "Jan." instead of "January").
   * @default false
   */
  shortMonth?: boolean;
  /**
   * If true, returns only the month name.
   * @default false
   */
  monthOnly?: boolean;
  /**
   * Include the year in the formatted date.
   * @default true
   */
  includeYear?: boolean;
}

/**
 * Formats a date into a readable string.
 * @param date The date or date string to format.
 * @param options Formatting options.
 * @returns A formatted date string.
 *
 * @example
 * ```typescript
 * const fullDate = formatDate(new Date('2023-10-05'));
 * console.log(fullDate); // 'October 5, 2023'
 *
 * const shortMonthDate = formatDate(new Date('2023-10-05'), { shortMonth: true });
 * console.log(shortMonthDate); // 'Oct. 5, 2023'
 *
 * const monthOnly = formatDate(new Date('2023-10-05'), { monthOnly: true });
 * console.log(monthOnly); // 'October'
 *
 * const noYearDate = formatDate(new Date('2023-10-05'), { includeYear: false });
 * console.log(noYearDate); // 'October 5'
 * ```
 */
export function formatDate(date: Date | string, options: DateOptions = {}): string {
  const parsedDate = new Date(date);
  const { shortMonth = false, monthOnly = false, includeYear = true } = options;

  if (isNaN(parsedDate.getTime())) {
    return '';
  }

  const day = parsedDate.getDate();
  const year = parsedDate.getFullYear();

  let month = MONTHS[parsedDate.getMonth()];

  if (shortMonth) {
    month = MONTHS_SHORT[parsedDate.getMonth()];
  }

  if (monthOnly) {
    return month || '';
  }

  if (includeYear) {
    return `${month} ${day}, ${year}`;
  }

  return `${month} ${day}`;
}
