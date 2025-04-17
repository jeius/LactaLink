export function sanitizeStreetAddress(input: string): string {
  return input.trim().replace(/[,|\s]+$/, '');
}
