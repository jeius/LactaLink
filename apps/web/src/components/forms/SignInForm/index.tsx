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
import { signInSchema, type SignInSchema } from '@lactalink/types/forms';
import { useForm } from 'react-hook-form';

import { FormBanner, FormBannerProps } from '@/components/forms/FormBanner';
import { Button } from '@/components/ui/button';
import { EyeClosedIcon, EyeIcon, LockIcon, MailIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { signIn } from '@/auth/actions/signIn';
import { SEARCH_PARAMS_KEYS } from '@/lib/constants/routes';
import { OTPType } from '@lactalink/types';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<FormBannerProps['message']>(null);
  const [status, setStatus] = useState<FormBannerProps['status']>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get(SEARCH_PARAMS_KEYS.REDIRECT);

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const isSubmitting = form.formState.isSubmitting;

  const email = form.watch('email');
  const password = form.watch('password');

  useEffect(() => {
    setStatus(undefined);
  }, [email, password]);

  async function onSubmit(formData: SignInSchema) {
    const { email } = formData;

    const { user, message } = await signIn(formData);

    if (!user) {
      setMessage(message);
      setStatus('failed');
      if (message.toLowerCase().includes('email not confirmed')) {
        const type: OTPType = 'signup';
        const emailParams = new URLSearchParams();
        emailParams.append('email', email);
        emailParams.append('type', type);
        router.push(`/auth/verify-otp?${emailParams.toString()}`);
      }
      return;
    }

    setMessage('🎉 Signed in successfully.');
    setStatus('success');

    if (redirect) {
      router.replace(redirect);
    } else {
      router.push('/');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="focus-within:outline-primary flex w-full items-center gap-1 overflow-clip rounded-full border pl-4 focus-within:outline-2">
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
                  <div className="focus-within:outline-primary flex w-full items-center gap-1 overflow-clip rounded-full border pl-4 focus-within:outline-2">
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
            className="text-muted-foreground hover:text-foreground p-0 text-xs hover:no-underline"
            size={'sm'}
            asChild
          >
            <Link href={'/auth/forgot-password'}>Forgot password?</Link>
          </Button>
        </div>

        <div className="flex w-full justify-center">
          <FormBanner status={status} message={message} />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mx-auto w-full max-w-md rounded-full py-6 text-lg font-normal"
          size="lg"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );
}
