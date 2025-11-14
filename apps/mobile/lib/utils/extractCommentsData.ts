import { Comment, Post } from '@lactalink/types/payload-generated-types';
import { isPost } from '@lactalink/utilities/type-guards';

export function extractCommentsData(input: Post | Comment) {
  const comments = isPost(input) ? input.comments : input.replies;
}
