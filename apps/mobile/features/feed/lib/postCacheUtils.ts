import { InfiniteDataMap } from '@/lib/types';
import { Post } from '@lactalink/types/payload-generated-types';
import { produce } from 'immer';

export function addPostToCache(
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
