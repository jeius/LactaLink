import { User } from '@lactalink/types';

export function extractName(user: User): string | null {
  if (user.profile) {
    const profile = user.profile.value;
    if (typeof profile === 'object') {
      if ('name' in profile) {
        return profile.name;
      } else {
        return profile.givenName;
      }
    }
  }
  return null;
}
