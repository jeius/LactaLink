import { QUERY_KEYS } from '@/lib/constants/queryKeys';
import { getStoredData, storeData } from '@/lib/localStorage/utils';
import { getMeUser } from '@/lib/stores/meUserStore';
import { InfiniteDataMap } from '@/lib/types';
import { getApiClient } from '@lactalink/api';
import { Post } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { infiniteQueryOptions } from '@tanstack/react-query';
import { produce } from 'immer';

const STORAGE_KEY = 'infinite-posts';

export const postsInfiniteOptions = infiniteQueryOptions({
  initialPageParam: 1,
  queryKey: QUERY_KEYS.POSTS.INFINITE,
  queryFn: fetchPosts,
  getNextPageParam: (page) => page.nextPage,
  getPreviousPageParam: (page) => page.prevPage,
  placeholderData: (prevData) => {
    if (!prevData) return getStoredInfinitePosts();
    storeInfinitePosts(prevData);
    return prevData;
  },
});

async function fetchPosts({ pageParam }: { pageParam: number }) {
  const api = getApiClient();
  const meUser = getMeUser();
  const meProfile = meUser?.profile;

  if (!meProfile) {
    throw new Error('Unable to fetch posts: No profile found for current user.');
  }

  const { docs, ...rest } = await api.find({
    collection: 'posts',
    page: pageParam,
    limit: 15,
    sort: '-createdAt',
    depth: 5,
    pagination: true,
    populate: {
      likes: { createdBy: true },
    },
    joins: {
      comments: false,
      shares: { count: true },
      likes: {
        count: true,
        where: {
          and: [
            { 'createdBy.relationTo': { equals: meProfile.relationTo } },
            { 'createdBy.value': { equals: extractID(meProfile.value) } },
          ],
        },
      },
    },
  });

  const map = new Map(docs.map((d) => [d.id, d]));
  return { docs: map, ...rest };
}

function getStoredInfinitePosts() {
  const stored = getStoredData<InfiniteDataMap<Post, number>>(STORAGE_KEY);
  if (!stored) return undefined;
  return produce(stored, (draft) => {
    draft.pages.forEach((page) => {
      // Convert Array of entries back into Map
      page.docs = new Map(page.docs);
    });
  });
}

function storeInfinitePosts(data: InfiniteDataMap<Post>) {
  storeData(STORAGE_KEY, {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      // Convert Map into Array of entries for storage serialization
      docs: Array.from(page.docs.entries()),
    })),
  });
}
