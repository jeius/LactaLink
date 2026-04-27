import { FormProps } from '@/components/contexts/FormProvider';
import { getSavedFormData, saveFormData } from '@/lib/localStorage/utils';
import { transformToImageSchema } from '@/lib/utils/transformData';
import { zodResolver } from '@hookform/resolvers/zod';
import { PostSchema, postSchema } from '@lactalink/form-schemas';
import { Post } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { useEffect } from 'react';
import { DefaultValues, useForm } from 'react-hook-form';
import { usePostQuery } from './queries';

export function usePostForm(postID?: string | null): Omit<FormProps<PostSchema>, 'children'> {
  const { data: post, ...query } = usePostQuery(postID);

  const methods = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
    defaultValues: post ? extractValues(post) : getSavedFormData('post-create') || {},
  });

  const { reset, getValues } = methods;

  // Reset form values when post data changes (e.g., when refetching)
  useEffect(() => {
    if (post) reset(extractValues(post));
  }, [post, reset]);

  // Saved form data on unmount (e.g., when navigating away)
  useEffect(() => {
    return () => {
      // Don't save if we have a post loaded, to avoid overwriting with incomplete data
      if (post) return;
      saveFormData('post-create', getValues());
    };
  }, [getValues, post]);

  return {
    ...methods,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    fetchError: query.error,
    refreshing: query.isRefetching,
    onRefresh: query.refetch,
    extraData: { post },
  };
}

function extractValues(post: Post): DefaultValues<PostSchema> {
  return {
    content: post.content,
    title: post.title,
    tags: post.tags?.map((t) => t.tag).filter(Boolean) as string[] | undefined,
    sharedFrom: post.sharedFrom
      ? { relationTo: post.sharedFrom.relationTo, value: extractID(post.sharedFrom.value) }
      : undefined,
    media: post.attachments
      ?.map((a) => {
        const image = extractCollection(a.image);
        if (!image) return null;
        return { image: transformToImageSchema(image), caption: a.caption };
      })
      .filter((a) => a !== null),
  };
}
