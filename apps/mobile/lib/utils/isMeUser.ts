import { getMeUser } from '@/lib/stores/meUserStore';
import { UserProfile } from '@lactalink/types';
import { User } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';

export function isMeUser(user: Pick<User, 'id'>): boolean {
  const meUser = getMeUser();
  if (!meUser) throw new Error('User not logged in!');
  return meUser.id === user.id;
}

export function isMeProfile(userProfile: UserProfile): boolean {
  const meUser = getMeUser();

  if (!meUser) throw new Error('User not logged in!');

  const meProfile = meUser.profile;
  if (!meProfile) throw new Error('Me user has no profile!');

  return isEqualProfiles(meProfile, userProfile);
}
