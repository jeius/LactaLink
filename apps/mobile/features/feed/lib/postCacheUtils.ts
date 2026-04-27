import { InfiniteDataMap } from '@/lib/types';
import { Post } from '@lactalink/types/payload-generated-types';
import { QueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import { createPostQueryOptions } from './queryOptions/posts';

export function addPostToInfCache(
  oldData: InfiniteDataMap<Post> | undefined,
  newPost: Post
): InfiniteDataMap<Post> | undefined {
  if (!oldData) return oldData;

  return produce(oldData, (draft) => {
    const firstPage = draft.pages[0];
    if (!firstPage) return;

    const posts = Array.from(firstPage.docs.values());
    posts.unshift(newPost);

    firstPage.docs = new Map(posts.map((p) => [p.id, p]));
    firstPage.totalDocs += 1;
  });
}

export function addPostToCache(client: QueryClient, post: Post) {
  const queryKey = createPostQueryOptions(post.id).queryKey;
  client.setQueryData(queryKey, post);
}
