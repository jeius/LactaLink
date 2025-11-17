import z from 'zod';
import { imageSchema } from './file';
import { emptyTransform } from './transformers';

const mediaSchema = z.object({
  image: z.object(imageSchema.shape, 'Image is required'),
  caption: z.string().transform(emptyTransform).optional(),
});

export const postSchema = z.object({
  title: z.string('Title is required').nonempty('Title is required'),
  content: z.string().transform(emptyTransform).optional(),
  tags: z.array(z.string()).optional(),
  media: z.array(mediaSchema).optional(),
  sharedFrom: z
    .object({
      relationTo: z.enum(['posts', 'donations', 'requests']),
      value: z.string(),
    })
    .optional(),
});

export type PostSchema = z.infer<typeof postSchema>;
export type MediaSchema = z.infer<typeof mediaSchema>;
