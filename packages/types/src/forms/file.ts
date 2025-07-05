import * as z from 'zod/v4';

export const imageSchema = z.object({
  alt: z.string().nonempty('Required').optional(),
  url: z.url('Invalid URL').nonempty('Required'),
  filename: z.string().nonempty('Required'),
  mimeType: z.string().nonempty('Required'),
  filesize: z.number().positive('Size must be a positive number').optional(),
  width: z.int().positive('Width must be a positive integer').optional(),
  height: z.int().positive('Height must be a positive integer').optional(),
});

export type ImageSchema = z.infer<typeof imageSchema>;
