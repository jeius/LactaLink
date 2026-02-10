/**
 * Transforms a city name from "CityName City" format to "City of CityName" format.
 *
 * @param cityName - The city name to format (e.g., "Calamba City").
 * @returns The formatted city name (e.g., "City of Calamba").
 *
 * @example
 * ```typescript
 * const result = formatCityName('Calamba City');
 * console.log(result); // 'City of Calamba'
 *
 * const result2 = formatCityName('Makati City');
 * console.log(result2); // 'City of Makati'
 * ```
 */
export function formatCityName(cityName: string): string {
  if (!cityName || typeof cityName !== 'string') return '';

  const trimmed = cityName.trim();

  // Check if the city name ends with " City" (case-sensitive)
  if (trimmed.endsWith(' City')) {
    // Remove " City" from the end and prepend "City of "
    const nameWithoutCity = trimmed.slice(0, -5); // Remove last 5 characters (" City")
    return `City of ${nameWithoutCity}`;
  }

  // If it doesn't end with " City", return the original (trimmed) name
  return trimmed;
}
