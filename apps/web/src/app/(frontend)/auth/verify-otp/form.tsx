'use client';

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { CheckCircle2Icon, DotIcon } from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { otpSchema, OtpSchema } from '@lactalink/types/forms';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { FormBanner, FormBannerProps } from '@/components/forms/FormBanner';
import { Button } from '@/components/ui/button';

import { verifyOtp } from '@/auth/actions/verifyOTP';
import { useGlobalState } from '@/hooks/useGlobalState';
import { QUERY_KEYS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { OTPType } from '@lactalink/types/auth';

const queryKey = QUERY_KEYS.VERIFY_OTP.MESSAGE;

interface OTPFormProps {
  email: string;
  type: OTPType;
}

export default function OTPForm({ email, type }: OTPFormProps) {
  const [message, setMessage] = useGlobalState<FormBannerProps['message']>(queryKey, null);
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
  }, [errorMessage, setMessage]);

  async function onSubmit({ otp }: OtpSchema) {
    const { user, message } = await verifyOtp({ token: otp, type, email });

    setMessage(message);

    if (!user) {
      setStatus('failed');
    } else {
      setStatus('success');
    }

    router.push('/');
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
          {isSubmitting ? (
            'Verifying...'
          ) : status === 'success' ? (
            <>
              <CheckCircle2Icon /> Verified
            </>
          ) : (
            'Verify'
          )}
        </Button>
      </form>
    </Form>
  );
}
