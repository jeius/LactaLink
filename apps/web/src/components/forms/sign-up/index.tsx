'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, SignUpSchema } from '@lactalink/types/forms';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { EyeClosedIcon, EyeIcon, LockIcon, MailIcon } from 'lucide-react';
import { useState } from 'react';

import { signUp } from '@/auth/actions';
import { User, VerifyOtp } from '@lactalink/types';
import { extractAuthErrorCode, extractErrorMessage } from '@lactalink/utilities';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function SignUpForm({ role }: { role?: User['role'] }) {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(formData: SignUpSchema) {
    const email = formData.email;

    try {
      await toast
        .promise(() => signUp(formData, role), {
          loading: 'Creating your account...',
          success: 'Account created successfully!',
          error: (error) => extractErrorMessage(error),
        })
        .unwrap();

      const type: VerifyOtp['type'] = 'signup';
      const params = new URLSearchParams(searchParams);
      params.set('email', email);
      params.set('type', type);
      router.push(`/auth/verify-otp?${params.toString()}`);
    } catch (error) {
      const code = extractAuthErrorCode(error);

      if (code === 'email_exists') {
        form.setError(
          'email',
          { message: 'Email already taken.', type: 'duplicate' },
          { shouldFocus: true }
        );
        return;
      }

      console.error('Error during sign up:', error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel className="mb-1">Email</FormLabel>
                <FormControl>
                  <div className="focus-within:outline-primary flex w-full items-center gap-1.5 overflow-clip rounded-xl border pl-2 focus-within:outline-2">
                    <MailIcon className="text-primary size-4" />
                    <Input
                      placeholder="Enter email address"
                      autoComplete="email webauthn"
                      type="email"
                      className="rounded-none border-none text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => {
            return (
              <FormItem>
                <div className="flex w-full items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Button
                    type="button"
                    variant={'ghost'}
                    size="icon"
                    className="text-muted-foreground hover:text-foreground size-fit rounded-xl px-2 hover:cursor-pointer hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeIcon /> : <EyeClosedIcon />}
                  </Button>
                </div>
                <FormControl>
                  <div className="focus-within:outline-primary flex w-full items-center gap-1.5 overflow-clip rounded-xl border pl-2 focus-within:outline-2">
                    <LockIcon className="text-primary size-4" />
                    <Input
                      placeholder="Enter your password"
                      autoComplete="current-password webauthn"
                      type={showPassword ? 'text' : 'password'}
                      className="rounded-none border-none text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => {
            return (
              <FormItem>
                <div className="flex w-full items-center justify-between">
                  <FormLabel>Confirm Password</FormLabel>
                  <Button
                    type="button"
                    variant={'ghost'}
                    size="icon"
                    className="text-muted-foreground hover:text-foreground size-fit rounded-xl px-2 hover:cursor-pointer hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeIcon /> : <EyeClosedIcon />}
                  </Button>
                </div>
                <FormControl>
                  <div className="focus-within:outline-primary flex w-full items-center gap-1.5 overflow-clip rounded-xl border pl-2 focus-within:outline-2">
                    <LockIcon className="text-primary size-4" />
                    <Input
                      placeholder="Confirm your password"
                      autoComplete="current-password webauthn"
                      type={showPassword ? 'text' : 'password'}
                      className="rounded-none border-none text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mx-auto mt-6 w-full max-w-md rounded-xl py-6 text-lg font-normal"
          size="lg"
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}
