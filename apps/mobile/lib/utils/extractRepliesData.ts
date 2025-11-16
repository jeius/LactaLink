import { Comment, Like, User } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractCollection } from '@lactalink/utilities/extractors';
import { extractLikesData } from './extractLikesData';

type ReplyData = {
  id: string;
  isUserComment: boolean;
  repliesCount: number;
  data: Comment;
  parent: Comment | undefined | null;
  like: Like | null;
  likesCount: number;
};

export function extractRepliesData(comment: Comment, user: User | null) {
  const userProfile = user?.profile;
  const repliesCount = comment.repliesCount ?? 0;
  const replies = comment.replies;

  const objArr = replies?.docs
    ?.map((c) => {
      const comment = extractCollection(c);
      if (!comment) return null;

      const author = comment.author;
      const isUserComment = userProfile ? isEqualProfiles(author, userProfile) : false;
      const { likeData, likesCount } = extractLikesData(comment, user);

      const commentData: ReplyData = {
        id: comment.id,
        data: comment,
        isUserComment: isUserComment,
        repliesCount: comment.repliesCount ?? 0,
        parent: comment.parent ? extractCollection(comment.parent) : null,
        like: likeData,
        likesCount: likesCount,
      };

      return [comment.id, commentData] as [string, ReplyData];
    })
    .filter((v) => v !== null);

  const repliesMap = new Map(objArr ?? []);

  return { count: repliesCount, map: repliesMap, replies };
}
