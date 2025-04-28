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

import { FormBanner, FormBannerProps } from '@/components/forms/FormBanner';
import { Button } from '@/components/ui/button';
import { EyeClosedIcon, EyeIcon, LockIcon, MailIcon } from 'lucide-react';
import { useState } from 'react';

import { signUp } from '@/auth/actions/signUp';
import { SEARCH_PARAMS_KEYS } from '@/lib/constants/routes';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<FormBannerProps['message']>(null);
  const [status, setStatus] = useState<FormBannerProps['status']>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get(SEARCH_PARAMS_KEYS.REDIRECT);

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(formData: SignUpSchema) {
    const { user } = await signUp({ ...formData, role: 'ADMIN' });

    if (!user) {
      setMessage(message);
      setStatus('failed');
      return;
    }
    setMessage('🎉 Admin created successfully.');
    setStatus('success');

    const emailParams = new URLSearchParams();
    emailParams.append('email', user.email);
    router.push(`/auth/verify-otp?${emailParams.toString()}`);
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
                <FormLabel className="mb-1 text-lg">Email</FormLabel>
                <FormControl>
                  <div className="focus-within:outline-primary flex w-full items-center gap-3 overflow-clip rounded-2xl border pl-4 focus-within:outline-2">
                    <MailIcon className="text-primary size-4" />
                    <Input
                      placeholder="Enter email address"
                      autoComplete="email webauthn"
                      type="email"
                      className="rounded-none border-none py-6 text-[1rem] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
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
                  <FormLabel className="text-lg">Password</FormLabel>
                  {showPassword ? (
                    <Button
                      type="button"
                      variant={'ghost'}
                      size="icon"
                      className="text-muted-foreground hover:text-foreground size-fit rounded-full border-none bg-transparent p-2"
                    >
                      <EyeIcon className="size-5" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant={'ghost'}
                      size="icon"
                      className="text-muted-foreground hover:text-foreground size-fit rounded-full border-none bg-transparent p-2"
                      onClick={() => setShowPassword(true)}
                    >
                      <EyeClosedIcon className="size-5" />
                    </Button>
                  )}
                </div>
                <FormControl>
                  <div className="focus-within:outline-primary flex w-full items-center gap-3 overflow-clip rounded-2xl border pl-4 focus-within:outline-2">
                    <LockIcon className="text-primary size-4" />
                    <Input
                      placeholder="Enter password"
                      autoComplete="new-password webauthn"
                      type={showPassword ? 'text' : 'password'}
                      className="rounded-none border-none py-6 text-[1rem] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
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
                  <FormLabel className="text-lg">Confirm Password</FormLabel>
                  {showPassword ? (
                    <Button
                      type="button"
                      variant={'ghost'}
                      size="icon"
                      className="text-muted-foreground hover:text-foreground size-fit rounded-full border-none bg-transparent p-2"
                    >
                      <EyeIcon className="size-5" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant={'ghost'}
                      size="icon"
                      className="text-muted-foreground hover:text-foreground size-fit rounded-full border-none bg-transparent p-2"
                      onClick={() => setShowPassword(true)}
                    >
                      <EyeClosedIcon className="size-5" />
                    </Button>
                  )}
                </div>
                <FormControl>
                  <div className="focus-within:outline-primary flex w-full items-center gap-3 overflow-clip rounded-2xl border pl-4 focus-within:outline-2">
                    <LockIcon className="text-primary size-4" />
                    <Input
                      placeholder="Confirm password"
                      autoComplete="new-password webauthn"
                      type={showPassword ? 'text' : 'password'}
                      className="rounded-none border-none py-6 text-[1rem] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <div className="flex w-full justify-center">
          <FormBanner status={status} message={message} />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mx-auto w-full rounded-2xl border-none py-6 text-lg"
          size="lg"
        >
          {isSubmitting ? 'Creating...' : 'Create Admin'}
        </Button>
      </form>
    </Form>
  );
}
