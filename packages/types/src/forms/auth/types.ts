import * as z from 'zod/v4';
import {
  emailSchema,
  forgotPasswordSchema,
  otpSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from './schema';

export type EmailSchema = z.infer<typeof emailSchema>;

export type SignInSchema = z.infer<typeof signInSchema>;

export type SignUpSchema = z.infer<typeof signUpSchema>;

export type OtpSchema = z.infer<typeof otpSchema>;

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
