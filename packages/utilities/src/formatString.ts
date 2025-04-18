export function sanitizeStreetAddress(input: string): string {
  return input.trim().replace(/[,|\s]+$/, '');
}

export function formatCamelCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2');
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
