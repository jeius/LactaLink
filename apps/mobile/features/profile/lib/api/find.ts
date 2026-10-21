import { getApiClient } from '@/lib/services';
import { PopulatedUserProfile, UserProfile } from '@lactalink/types';
import { Hospital, Individual, MilkBank } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';

type ProfileDocument = Hospital | Individual | MilkBank;

async function populateAvatar<T extends ProfileDocument>(doc: T, init?: RequestInit): Promise<T> {
  if (typeof doc.avatar !== 'string') return doc;

  const avatar = await getApiClient().findByID(
    {
      collection: 'avatars',
      id: doc.avatar,
      depth: 1,
      trash: true,
    },
    init
  );

  return { ...doc, avatar };
}

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
            trash: true,
            joins: { posts: { count: true, limit: 10 } },
          },
          init
        )
      : await apiClient.findByID(
          {
            collection: slug,
            id: id,
            depth: 3,
            trash: true,
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

  return { relationTo: slug, value: await populateAvatar(data, init) } as PopulatedUserProfile;
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
              trash: true,
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
              trash: true,
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

    return Promise.all(
      profileDocs.map(async (doc) => ({ relationTo: slug, value: await populateAvatar(doc, init) }))
    );
  };

  const results = await Promise.all([
    fetchProfilesByType(individuals, 'individuals'),
    fetchProfilesByType(hospitals, 'hospitals'),
    fetchProfilesByType(milkBanks, 'milkBanks'),
  ]);

  return results.flat() as PopulatedUserProfile[];
}
