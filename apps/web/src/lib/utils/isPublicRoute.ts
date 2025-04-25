export function isPublicRoute(path: string, bases: string[]): boolean {
  return bases.some((base) => path.startsWith(base));
}
