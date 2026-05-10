import { getApiClient } from '@/lib/services';
import { PopulatedUserProfile, UserProfile } from '@lactalink/types';
import { extractID } from '@lactalink/utilities/extractors';

export async function findProfile(profile: UserProfile, init?: RequestInit) {
  const { relationTo: slug, value } = profile;
  if (!slug || !value) throw new Error('Invalid profile object: missing relationTo or value.');
  const apiClient = getApiClient();
  const id = extractID(value);

  const data =
    slug === 'individuals'
      ? await apiClient.findByID(
          {
            collection: slug,
            id: id,
            depth: 3,
            joins: { posts: { count: true, limit: 10 } },
          },
          init
        )
      : await apiClient.findByID(
          {
            collection: slug,
            id: id,
            depth: 3,
            joins: {
              inventory: { count: true, limit: 0 },
              posts: { count: true, limit: 0 },
              milkBags: { count: true, limit: 0 },
              receivedTransactions: { count: true, limit: 0 },
              sentTransactions: { count: true, limit: 0 },
            },
          },
          init
        );

  return { relationTo: slug, value: data } as PopulatedUserProfile;
}

export async function findMultipleProfiles(
  profiles: UserProfile[],
  init?: RequestInit
): Promise<PopulatedUserProfile[]> {
  const apiClient = getApiClient();

  const individuals: UserProfile[] = [];
  const hospitals: UserProfile[] = [];
  const milkBanks: UserProfile[] = [];

  for (const profile of profiles) {
    const { relationTo: slug } = profile;
    switch (slug) {
      case 'individuals':
        individuals.push(profile);
        break;
      case 'hospitals':
        hospitals.push(profile);
        break;
      case 'milkBanks':
        milkBanks.push(profile);
        break;
    }
  }

  const fetchProfilesByType = async (profiles: UserProfile[], slug: UserProfile['relationTo']) => {
    const ids = profiles.map((profile) => extractID(profile.value));

    if (ids.length === 0) return [];

    const profileDocs =
      slug === 'individuals'
        ? await apiClient.find(
            {
              collection: slug,
              depth: 3,
              where: { id: { in: ids } },
              pagination: false,
              limit: ids.length,
              joins: { posts: { count: true, limit: 10 } },
            },
            init
          )
        : await apiClient.find(
            {
              collection: slug,
              depth: 3,
              where: { id: { in: ids } },
              pagination: false,
              limit: ids.length,
              joins: {
                inventory: { count: true, limit: 0 },
                posts: { count: true, limit: 0 },
                milkBags: { count: true, limit: 0 },
                receivedTransactions: { count: true, limit: 0 },
                sentTransactions: { count: true, limit: 0 },
              },
            },
            init
          );

    return profileDocs.map((doc) => ({ relationTo: slug, value: doc }));
  };

  const results = await Promise.all([
    fetchProfilesByType(individuals, 'individuals'),
    fetchProfilesByType(hospitals, 'hospitals'),
    fetchProfilesByType(milkBanks, 'milkBanks'),
  ]);

  return results.flat() as PopulatedUserProfile[];
}
