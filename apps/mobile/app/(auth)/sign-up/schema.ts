import { API_URL } from '@/lib/constants';
import { signInSchema } from '@lactalink/types';
import { isEmailTaken } from '@lactalink/utilities';
import { z } from 'zod';

export const signUpSchema = signInSchema.superRefine(async (data, ctx) => {
  const result = await isEmailTaken({ email: data.email, apiUrl: API_URL });

  if (typeof result === 'string') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: result,
      path: ['email'],
    });
  } else if (result === true) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Email is already taken.',
      path: ['email'],
    });
  }
});

export type SignUpSchema = z.infer<typeof signUpSchema>;
