import { useMeUser } from '@/hooks/auth/useAuth';
import { useRecyclingState } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { extractLikesData } from '../lib/extractLikesData';
import { LikableRelation } from '../lib/types';
import { useAddLikeMutation, useDeleteLikeMutation } from './mutations';

/**
 * Hook for managing like interactions on posts and comments
 */
export function useLikeInteraction(doc: LikableRelation) {
  const { data: user } = useMeUser();

  // Extract current like state
  const { likeData: currentLike, likesCount } = useMemo(
    () => extractLikesData(doc.value, user),
    [doc, user]
  );

  const [liked, setLiked] = useRecyclingState(!!currentLike, [currentLike]);
  const [count, setCount] = useRecyclingState(likesCount, [likesCount]);

  const { mutate: addLike, isPending: isLiking } = useAddLikeMutation(doc);
  const { mutate: deleteLike, isPending: isUnliking } = useDeleteLikeMutation(doc);

  const toggleLike = useCallback(() => {
    if (currentLike) {
      deleteLike(currentLike.id);
      setCount((prev) => Math.max(0, prev - 1));
    } else {
      addLike();
      setCount((prev) => prev + 1);
    }
    setLiked((prev) => !prev);
  }, [currentLike, setLiked, deleteLike, setCount, addLike]);

  return {
    hasLiked: liked,
    likesCount: count,
    isPending: isLiking || isUnliking,
    isLiking,
    isUnliking,
    likeData: currentLike,
    toggleLike: toggleLike,
  };
}
