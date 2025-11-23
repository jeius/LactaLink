import { useFetchById } from '@/hooks/collections/useFetchById';
import { User } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import isString from 'lodash/isString';

export function useProfileData(profile: User['profile']) {
  const profileData = profile ? profile.value : profile;
  const slug = profile ? profile.relationTo : 'individuals';
  const query = useFetchById(isString(profileData), {
    collection: slug,
    id: extractID(profileData) || '',
  });

  return { ...query, data: extractCollection(profileData) || query.data };
}
