import z from 'zod';

const lexicalChildSchema = z.looseObject({
  type: z.any(),
  version: z.number(),
});

const lexicalRootSchema = z.looseObject({
  type: z.string(),
  children: z.array(lexicalChildSchema),
  direction: z.enum(['ltr', 'rtl']).nullable(),
  format: z.enum(['left', 'start', 'center', 'right', 'end', 'justify', '']),
  indent: z.number(),
  version: z.number(),
});

const lexicalMessageSchema = z.looseObject({ root: lexicalRootSchema });

export const messageBlockSchema = z.object({
  blockType: z.literal('message'),
  blockName: z.string().nullish(),
  id: z.string().nullish(),
  message: lexicalMessageSchema.nullish(),
});

export type MessageBlockSchema = z.infer<typeof messageBlockSchema>;
