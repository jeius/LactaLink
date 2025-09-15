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
import { signInSchema, type SignInSchema } from '@lactalink/form-schemas';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { EyeClosedIcon, EyeIcon, LockIcon, MailIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { signIn } from '@/auth/actions';
import { SEARCH_PARAMS_KEYS } from '@/lib/constants/routes';
import { VerifyOtp } from '@lactalink/types/auth';
import { extractErrorMessage, extractName } from '@lactalink/utilities/extractors';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get(SEARCH_PARAMS_KEYS.REDIRECT);

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(formData: SignInSchema) {
    const { email } = formData;
    const type: VerifyOtp['type'] = 'signup';

    try {
      const signInResult = await toast
        .promise(() => signIn(formData), {
          loading: 'Signing in...',
          success: ({ user, needsVerification }) => {
            if (needsVerification) {
              return `Verification email sent to ${email}`;
            }
            if (!user) {
              return 'No user found after sign-in';
            }
            const name = extractName(user) || user.email;
            return `Welcome back, ${name}!👋 `;
          },
          error: (error) => extractErrorMessage(error),
        })
        .unwrap();

      if (signInResult.needsVerification) {
        const emailParams = new URLSearchParams();
        emailParams.set('email', email);
        emailParams.set('type', type);
        router.push(`/auth/verify-otp?${emailParams.toString()}`);
      } else if (signInResult.success) {
        if (redirect) {
          router.replace(redirect);
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Sign-in error:', error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Email</FormLabel>
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
                    className="text-muted-foreground hover:text-foreground size-fit rounded-full px-2 hover:cursor-pointer hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeIcon /> : <EyeClosedIcon />}
                  </Button>
                </div>
                <FormControl>
                  <div className="focus-within:outline-primary flex w-full items-center gap-1.5 overflow-clip rounded-xl border pl-2 focus-within:outline-2">
                    <LockIcon className="text-primary size-4" />
                    <Input
                      placeholder="Enter password"
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

        <div>
          <Button
            type="button"
            variant={'link'}
            className="text-muted-foreground hover:text-foreground -mt-6 p-0 text-xs hover:no-underline"
            size={'sm'}
            asChild
          >
            <Link href={'/auth/forgot-password'}>Forgot password?</Link>
          </Button>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mx-auto mt-6 w-full max-w-md rounded-xl py-6 text-lg font-normal"
          size="lg"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );
}
