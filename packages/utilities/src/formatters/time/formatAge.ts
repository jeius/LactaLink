/**
 * Calculates age from a birth date, accounting for leap years and exact dates
 * @param birthDate - The birth date (Date object or ISO string)
 * @param referenceDate - Optional reference date (defaults to today)
 * @returns Age in years
 *
 * @example
 * ```typescript
 * const age = calculateAge('1990-05-15');
 * console.log(age); // 34 (if current year is 2024)
 *
 * const ageAtDate = calculateAge('1990-05-15', new Date('2020-01-01'));
 * console.log(ageAtDate); // 29
 * ```
 */
export function calculateAge(birthDate: Date | string, referenceDate: Date = new Date()): number {
  const birth = new Date(birthDate);
  const reference = new Date(referenceDate);

  // Validate dates
  if (isNaN(birth.getTime()) || isNaN(reference.getTime())) {
    throw new Error('Invalid date provided');
  }

  // Calculate age
  let age = reference.getFullYear() - birth.getFullYear();
  const monthDiff = reference.getMonth() - birth.getMonth();

  // Adjust if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birth.getDate())) {
    age--;
  }

  return Math.max(0, age); // Ensure non-negative age
}

/**
 * Calculates age with fractional years (e.g., for babies under 1 year)
 * @param birthDate - The birth date
 * @param referenceDate - Optional reference date (defaults to today)
 * @returns Age in years with decimal precision
 *
 * @example
 * ```typescript
 * const preciseAge = calculatePreciseAge('2023-06-15');
 * console.log(preciseAge); // 1.5 (if current date is 2024-12-15)
 * ```
 */
export function calculatePreciseAge(
  birthDate: Date | string,
  referenceDate: Date = new Date()
): number {
  const birth = new Date(birthDate);
  const reference = new Date(referenceDate);

  if (isNaN(birth.getTime()) || isNaN(reference.getTime())) {
    throw new Error('Invalid date provided');
  }

  const diffMs = reference.getTime() - birth.getTime();
  const ageYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);

  return Math.max(0, Number(ageYears.toFixed(2)));
}

/**
 * Formats age as a human-readable string
 * @param birthDate - The birth date
 * @param referenceDate - Optional reference date (defaults to today)
 * @returns Formatted age string (e.g., "2 months", "34 years")
 *
 * @example
 * ```typescript
 * formatAge('2023-10-15'); // "1 year"
 * formatAge('2024-10-15'); // "2 months"
 * formatAge('1990-05-15'); // "34 years"
 * ```
 */
export function formatAge(birthDate: Date | string, referenceDate: Date = new Date()): string {
  const birth = new Date(birthDate);
  const reference = new Date(referenceDate);

  if (isNaN(birth.getTime()) || isNaN(reference.getTime())) {
    return 'Unknown';
  }

  const diffMs = reference.getTime() - birth.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Less than 1 month
  if (diffDays < 30) {
    return diffDays === 1 ? '1 day' : `${diffDays} days`;
  }

  // Less than 1 year
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month' : `${months} months`;
  }

  // 1 year or more
  const years = calculateAge(birth, reference);
  return years === 1 ? '1 year' : `${years} years`;
}
