import { Post } from '@lactalink/types/payload-generated-types';
import { CollectionBeforeChangeHook } from 'payload';

export const setSummary: CollectionBeforeChangeHook<Post> = ({ data }) => {
  if (!data.content) {
    data.summary = null;
  } else {
    data.summary = data.content.slice(0, 280);
  }
  return data;
};
