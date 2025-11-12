import { Post } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { Validate } from 'payload';

export const preventCircularShares: Validate = async (value: Post['sharedFrom'], { req, data }) => {
  if (!value || !data?.id) return true;

  if (value.relationTo !== 'posts') return true;

  // Check if the post being shared has this post as its sharedFrom
  const sharedPost = await req.payload.findByID({
    collection: value.relationTo,
    id: extractID(value.value),
    depth: 1,
  });

  const sharedFromID = extractID(sharedPost.sharedFrom?.value);

  if (sharedFromID !== data.id) return true;

  return 'Cannot share a post that already shares this post (circular reference)';
};
