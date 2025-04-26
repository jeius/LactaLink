'use client';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { DotIcon } from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { otpSchema, OtpSchema } from '@lactalink/types/forms';
import { useForm } from 'react-hook-form';

import { FormBanner, FormBannerProps } from '@/components/FormBanner';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

import { verifySignup } from '@/auth/actions/verifyOTP';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function OTPForm() {
  const [message, setMessage] = useState<FormBannerProps['message']>(null);
  const [status, setStatus] = useState<FormBannerProps['status']>();
  const router = useRouter();

  const form = useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const isSubmitting = form.formState.isSubmitting;
  const errorMessage = form.formState.errors.otp?.message;

  useEffect(() => {
    if (errorMessage) setMessage(errorMessage);
  }, [errorMessage]);

  async function onSubmit(formData: OtpSchema) {
    const { error } = await verifySignup(formData.otp);

    if (error) {
      setMessage(error.message);
      setStatus('failed');
    } else {
      setStatus('success');
      router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-8">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => {
            return (
              <FormItem>
                <FormControl>
                  <InputOTP containerClassName="justify-center" maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot className="h-14 w-12 text-lg" index={0} />
                      <InputOTPSlot className="h-14 w-12 text-lg" index={1} />
                    </InputOTPGroup>
                    <InputOTPSeparator>
                      <DotIcon />
                    </InputOTPSeparator>
                    <InputOTPGroup>
                      <InputOTPSlot className="h-14 w-12 text-lg" index={2} />
                      <InputOTPSlot className="h-14 w-12 text-lg" index={3} />
                    </InputOTPGroup>
                    <InputOTPSeparator>
                      <DotIcon />
                    </InputOTPSeparator>
                    <InputOTPGroup>
                      <InputOTPSlot className="h-14 w-12 text-lg" index={4} />
                      <InputOTPSlot className="h-14 w-12 text-lg" index={5} />
                    </InputOTPGroup>
                  </InputOTP>
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
          size="lg"
          disabled={isSubmitting}
          className={cn(
            'mx-auto w-full max-w-md rounded-2xl py-6 text-lg font-normal',
            isSubmitting ? 'cursor-progress' : 'cursor-default'
          )}
        >
          {isSubmitting ? 'Verifying...' : 'Verify'}
        </Button>
      </form>
    </Form>
  );
}
