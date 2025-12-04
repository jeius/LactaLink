import z from 'zod';

const idSchema = z.uuid('Invalid UUID format for participant ID');

export const directConvoParticipantsSchema = z.tuple(
  [idSchema, idSchema],
  'Invalid participant IDs'
);

export type FindDirectConversationParams = z.infer<typeof directConvoParticipantsSchema>;
