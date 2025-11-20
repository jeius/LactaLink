import { Comment } from '@lactalink/types/payload-generated-types';
import { QueryKey } from '@tanstack/react-query';
import { create } from 'zustand/react';

interface CommentStore {
  replyTo: Comment | null;
  parentComment: Comment | null;
  queryKey: QueryKey | null;
  actions: {
    setReplyTo: (comment: Comment | null) => void;
    setParentComment: (comment: Comment | null) => void;
    setQueryKey: (queryKey: QueryKey | null) => void;
    reset: () => void;
  };
}

export const useCommentStore = create<CommentStore>((set) => ({
  replyTo: null,
  parentComment: null,
  queryKey: null,
  actions: {
    setReplyTo: (comment) => set({ replyTo: comment || null }),
    setParentComment: (comment) => set({ parentComment: comment || null }),
    setQueryKey: (queryKey) => set({ queryKey }),
    reset: () => set({ replyTo: null, parentComment: null }),
  },
}));
