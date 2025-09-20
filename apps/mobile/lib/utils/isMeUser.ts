import { getMeUser } from '@/lib/stores/meUserStore';
import { User } from '@lactalink/types/payload-generated-types';

export function isMeUser(user: Pick<User, 'id'>): boolean {
  const meUser = getMeUser();
  return meUser?.id === user.id;
}
