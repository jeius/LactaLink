import { UserProfile } from '@lactalink/types';
import { z } from 'zod';

export const recipientSchema = z.object({
  relationTo: z.custom<UserProfile['relationTo']>(),
  value: z.uuid('Invalid recipient ID').nonempty('Recipient ID is required'),
});
