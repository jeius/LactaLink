import z from 'zod';
import { imageSchema } from './file';
import { emptyTransform } from './transformers';

const mediaSchema = z.object({
  id: z.string().nullish(),
  image: z.object(imageSchema.shape, 'Image is required'),
  caption: z.string().transform(emptyTransform).nullish(),
});

export const postSchema = z.object({
  title: z.string('Title is required').nonempty('Title is required'),
  content: z.string().transform(emptyTransform).nullish(),
  tags: z.array(z.string()).nullish(),
  media: z.array(mediaSchema).nullish(),
  sharedFrom: z
    .object({
      relationTo: z.enum(['posts', 'donations', 'requests']),
      value: z.string(),
    })
    .nullish(),
});

export type PostSchema = z.infer<typeof postSchema>;
export type MediaSchema = z.infer<typeof mediaSchema>;
