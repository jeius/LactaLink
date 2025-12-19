import { Presence, useUsersPresence } from '@/lib/stores/presenceStore';
import { User } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { useMemo } from 'react';

export function useUserPresence(user: string | User | null | undefined): Presence | null {
  const userDoc = extractCollection(user);
  const onlineAt = userDoc?.onlineAt ?? undefined;

  const users = useUsersPresence();
  const presence = useMemo(() => (user ? users.get(extractID(user)) : null), [users, user]);

  if (!presence) return null;

  return {
    ...presence,
    onlineAt: presence.onlineAt ?? onlineAt,
  };
}
