import { formatDate } from './formatDate';
import { formatLocaleTime } from './formatTime';

/**
 * Formats a given date into a human-readable label.
 * @param date - The date to format.
 * @param type - The format type, either 'short' or 'long'. Defaults to 'short'.
 * @returns - A formatted string representing the time elapsed since the given date.
 *
 * @example
 * ```typescript
 * const labelShort = formatTimeToPastLabel(new Date(Date.now() - 5 * 60 * 1000), 'short');
 * console.log(labelShort); // '5min'
 *
 * const labelLong = formatTimeToPastLabel(new Date(Date.now() - 2 * 60 * 60 * 1000), 'long');
 * console.log(labelLong); // '2 hours ago'
 * ```
 */
export function formatTimeToPastLabel(
  date: Date | string,
  type: 'short' | 'long' = 'short'
): string {
  const now = new Date();
  const createdDate = new Date(date);
  const diffInMs = now.getTime() - createdDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInMinutes < 1) return type === 'long' ? 'Just now' : 'Now';

  if (diffInMinutes < 60)
    return type === 'long'
      ? `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
      : `${diffInMinutes}min${diffInMinutes > 1 ? 's' : ''}`;

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24)
    return type === 'long'
      ? `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
      : `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays < 7)
    return type === 'long' ? `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago` : `${diffInDays}d`;
  else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return type === 'long' ? `${weeks} week${weeks > 1 ? 's' : ''} ago` : `${weeks}w`;
  }

  const months = Math.floor(diffInDays / 30);
  if (months < 12)
    return type === 'long' ? `${months} month${months > 1 ? 's' : ''} ago` : `${months}m`;

  const years = Math.floor(months / 12);
  return type === 'long' ? `${years} year${years > 1 ? 's' : ''} ago` : `${years}y`;
}

/**
 * Formats a date to either a time label or a date label based on how old the date is.
 * @param date - The date to format.
 * @returns - A formatted string representing either the time or date label.
 *
 * @example
 * ```typescript
 * const labelToday = formatTimeOrDateLabel(new Date());
 * console.log(labelToday); // e.g., '3:45 PM'
 *
 * const labelYesterday = formatTimeOrDateLabel(new Date(Date.now() - 24 * 60 * 60 * 1000));
 * console.log(labelYesterday); // 'Yesterday'
 *
 * const labelThisYear = formatTimeOrDateLabel(new Date('2024-03-15'));
 * console.log(labelThisYear); // 'Mar. 15'
 *
 * const labelLastYear = formatTimeOrDateLabel(new Date('2023-06-10'));
 * console.log(labelLastYear); // 'Jun. 10, 2023'
 * ```
 */
export function formatTimeOrDateLabel(date: string | Date): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 1) {
    return formatLocaleTime(targetDate);
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else {
    const diffInYears = now.getFullYear() - targetDate.getFullYear();
    if (diffInYears > 0) {
      return formatDate(targetDate, { shortMonth: true, includeYear: true });
    }
    return formatDate(targetDate, { shortMonth: true, includeYear: false });
  }
}
