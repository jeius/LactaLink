import { z } from 'zod';

const emailSchema = z.string().email('Invalid email address');

const passwordSchema = z.string().min(8, 'Password must be at least 8 characters long');

const confirmPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z
  .object({
    email: emailSchema,
  })
  .and(confirmPasswordSchema);

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = confirmPasswordSchema;

export type SignInSchema = z.infer<typeof signInSchema>;

export type SignUpSchema = z.infer<typeof signUpSchema>;

export type OtpSchema = z.infer<typeof otpSchema>;

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
