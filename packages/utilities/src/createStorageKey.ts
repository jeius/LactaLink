import { extractID } from './extractors/extractID';

export function createStorageKeyByUser(user: string | { id: string } | null, baseKey: string) {
  if (!user) return baseKey;
  const userId = extractID(user);
  return `${baseKey}-${userId}`;
}
