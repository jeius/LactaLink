const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTHS_SHORT = [
  'Jan.',
  'Feb.',
  'Mar.',
  'Apr.',
  'May.',
  'Jun.',
  'Jul.',
  'Aug.',
  'Sept.',
  'Oct.',
  'Nov.',
  'Dec.',
];

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

interface DateOptions {
  shortMonth?: boolean;
  monthOnly?: boolean;
  includeYear?: boolean;
}

export function formatDate(param: Date | string, options: DateOptions = {}): string {
  const date = new Date(param);
  const { shortMonth = false, monthOnly = false, includeYear = true } = options;

  if (isNaN(date.getTime())) {
    return '';
  }

  const day = date.getDate();
  const year = date.getFullYear();

  let month = MONTHS[date.getMonth()];

  if (shortMonth) {
    month = MONTHS_SHORT[date.getMonth()];
  }

  if (monthOnly) {
    return month || '';
  }

  if (includeYear) {
    return `${month} ${day}, ${year}`;
  }

  return `${month} ${day}`;
}

export function formatLocaleTime(param: Date | string): string {
  const date = new Date(param);

  if (isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString('en', {
    timeStyle: 'short',
    hour12: true,
  });
}

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
