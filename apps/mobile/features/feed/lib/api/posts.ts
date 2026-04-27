import { uploadImage } from '@/lib/api/file';
import { getApiClient } from '@/lib/services';
import { getMeUser } from '@/lib/stores/meUserStore';
import { PostSchema } from '@lactalink/form-schemas';
import { Image, Post } from '@lactalink/types/payload-generated-types';
import { PostError } from '@lactalink/utilities/errors';
import {
  extractErrorStatus,
  extractErrorStatusText,
  extractID,
} from '@lactalink/utilities/extractors';

export async function getPublishedPosts(
  { page, limit = 15 }: { page: number; limit?: number },
  init?: RequestInit
) {
  const meUser = getMeUser();
  const meProfile = meUser?.profile;

  return getApiClient().find(
    {
      collection: 'posts',
      page: page,
      limit: limit,
      sort: '-createdAt',
      depth: 2,
      pagination: true,
      where: { status: { equals: 'PUBLISHED' } },
      populate: { likes: { createdBy: true } },
      joins: {
        comments: false,
        shares: false,
        likes: !meProfile
          ? false
          : {
              count: true,
              where: {
                and: [
                  { 'createdBy.relationTo': { equals: meProfile.relationTo } },
                  { 'createdBy.value': { equals: extractID(meProfile.value) } },
                ],
              },
            },
      },
    },
    init
  );
}

export async function getPostByID(id: string, init?: RequestInit) {
  const meUser = getMeUser();
  const meProfile = meUser?.profile;

  return getApiClient().findByID(
    {
      collection: 'posts',
      id,
      depth: 2,
      joins: {
        comments: { count: true, limit: 10 },
        shares: false,
        likes: !meProfile
          ? false
          : {
              count: true,
              where: {
                and: [
                  { 'createdBy.relationTo': { equals: meProfile.relationTo } },
                  { 'createdBy.value': { equals: extractID(meProfile.value) } },
                ],
              },
            },
      },
    },
    init
  );
}

export async function createPost(data: PostSchema, init?: RequestInit) {
  const meUser = getMeUser();
  if (!meUser) throw new Error('User must be logged in to create a post');

  const profile = meUser?.profile;
  if (!profile) throw new Error('User must setup a profile before creating a post');

  const apiClient = getApiClient();
  const uploadedImages: Image[] = [];

  const attachments = !data.media
    ? []
    : await Promise.all(
        data.media.map(async ({ image, caption }) => {
          const uploadedImage = await uploadImage('images', image);
          uploadedImages.push(uploadedImage);
          return { image: uploadedImage.id, caption, mediaType: 'IMAGE' } as const;
        })
      ).catch((err) => {
        throw new PostError<Partial<Post>>('Failed to upload images', {
          cause: err,
          data: {
            attachments: uploadedImages.map((img) => ({ image: img.id, mediaType: 'IMAGE' })),
          },
          statusCode: extractErrorStatus(err),
          statusText: extractErrorStatusText(err),
        });
      });

  return apiClient.create(
    {
      collection: 'posts',
      data: {
        title: data.title,
        content: data.content,
        attachments: attachments,
        visibility: 'PUBLIC',
        tags: data.tags?.map((tag) => ({ tag })),
        author: { relationTo: profile.relationTo, value: extractID(profile.value) },
        sharedFrom: data.sharedFrom,
      },
    },
    init
  );
}
