export function sanitizeStreetAddress(input: string): string {
  return input.trim().replace(/[,|\s]+$/, '');
}

export function formatCamelCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
}

export function formatCamelCaseCaps(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (char) => char.toUpperCase());
}

export function formatCamelCaseAllCaps(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function toKebabCase(string: string): string {
  return string
    ?.replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

export function capitalizeAll(str: string) {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function ensureEndsWithDot(str?: string | null) {
  if (!str) return str;
  return str.endsWith('.') ? str : `${str}.`;
}

export function formatKebabToTitle(str: string) {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatKebab(str: string) {
  return str.split('-').join(' ');
}
