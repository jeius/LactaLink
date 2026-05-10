import { QUERY_KEYS } from '@/lib/constants';
import { getApiClient } from '@/lib/services';
import { generatePlaceHoldersForInfQueries } from '@/lib/utils/generatePlaceholdersForInfQueries';
import { PopulatedUserProfile, UserProfile } from '@lactalink/types';
import { User } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { transformToPaginatedMappedDocs } from '@lactalink/utilities/transformers';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { findMultipleProfiles, findProfile } from './api/find';
import { getPaginatedUserPosts } from './api/getPaginatedUserPosts';

export function createInfiniteUserPostsQuery(profile: PopulatedUserProfile) {
  const userID = extractID(profile.value.owner);

  return infiniteQueryOptions({
    initialPageParam: 1,
    queryKey: [...QUERY_KEYS.POSTS.INFINITE, userID],
    queryFn: async ({ pageParam = 1 }) => {
      const paginatedDocs = await getPaginatedUserPosts(profile, pageParam);
      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: ({ nextPage }) => nextPage,
    getPreviousPageParam: ({ prevPage }) => prevPage,
    placeholderData: (prev) => {
      if (prev) return prev;
      return generatePlaceHoldersForInfQueries(10);
    },
  });
}

export function createUserProfileQuery(profile: UserProfile | undefined | null) {
  const profileDoc = extractCollection(profile?.value) ?? undefined;
  const slug = profile?.relationTo;
  const id = extractID(profile?.value);
  return queryOptions({
    enabled: !!id && !!slug,
    queryKey: [...QUERY_KEYS.PROFILE.ONE, id, slug],
    queryFn: async ({ signal, client }): Promise<PopulatedUserProfile> => {
      if (!profile) throw new Error('User has no profile to fetch.');
      const result = await findProfile(profile, { signal });
      client.setQueryData(createProfileByUserQuery(result.value.owner).queryKey, result);
      return result;
    },
    placeholderData: (prev) => {
      if (!prev && slug && profileDoc)
        return { relationTo: slug, value: profileDoc } as PopulatedUserProfile;
      return prev;
    },
  });
}

export function createProfileByUserQuery(user: string | User | null | undefined) {
  const userID = extractID(user);
  return queryOptions({
    enabled: !!userID,
    queryKey: [...QUERY_KEYS.PROFILE.ONE, 'user', userID].filter(Boolean),
    queryFn: async ({ signal, client }): Promise<PopulatedUserProfile | null> => {
      if (!userID) throw new Error('No user provided to fetch profile for.');

      const apiClient = getApiClient();

      const { profile } = await apiClient.findByID({
        collection: 'users',
        id: userID,
        depth: 0,
        select: { profile: true },
      });

      if (!profile) return null;
      const result = await findProfile(profile, { signal });
      client.setQueryData(createUserProfileQuery(result).queryKey, result);
      return result;
    },
    placeholderData: (prev) => {
      if (prev) return prev;
      const userDoc = extractCollection(user);
      const profileDoc = extractCollection(userDoc?.profile?.value);
      if (userDoc?.profile && profileDoc) {
        return { ...userDoc.profile, value: profileDoc } as PopulatedUserProfile;
      }
      return;
    },
  });
}

export function createMultipleProfilesByUsersQuery(users: (string | User)[]) {
  const userIDs = extractID(users).filter(Boolean);
  return queryOptions({
    enabled: userIDs.length > 0,
    queryKey: [...QUERY_KEYS.PROFILE.MANY, 'users', ...userIDs].filter(Boolean),
    queryFn: async ({ signal }): Promise<PopulatedUserProfile[]> => {
      if (!userIDs.length) throw new Error('No users provided to fetch profiles for.');
      const apiClient = getApiClient();
      const userDocs = await apiClient.find({
        collection: 'users',
        where: { id: { in: userIDs } },
        depth: 1,
        pagination: false,
        limit: userIDs.length,
        select: { profile: true },
      });
      return findMultipleProfiles(
        userDocs
          .map((user) => {
            if (!user.profile) {
              console.warn(`User with ID ${user.id} has no profile field.`);
            }
            return user.profile;
          })
          .filter(Boolean) as UserProfile[],
        { signal }
      );
    },
  });
}
