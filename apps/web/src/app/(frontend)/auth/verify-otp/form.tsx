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
import { otpSchema, OtpSchema } from '@lactalink/form-schemas/auth';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

import { verifyOtp } from '@/auth/actions';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { VerifyOtp } from '@lactalink/types/auth';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { toast } from 'sonner';

export default function OTPForm(props: VerifyOtp) {
  const router = useRouter();

  const form = useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit({ otp: token }: OtpSchema) {
    try {
      await toast
        .promise(() => verifyOtp({ ...props, token }), {
          loading: 'Verifying OTP...',
          success: 'OTP verified successfully.',
          error: (error) => extractErrorMessage(error),
        })
        .unwrap();

      router.push('/');
    } catch (error) {
      console.error('Error verifying OTP:', error);
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
                  <ScrollArea className="w-full">
                    <InputOTP containerClassName="mx-auto w-fit" maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot className="h-14 w-8 sm:w-12 sm:text-lg" index={0} />
                        <InputOTPSlot className="h-14 w-8 sm:w-12 sm:text-lg" index={1} />
                      </InputOTPGroup>
                      <InputOTPSeparator>
                        <DotIcon className="size-4" />
                      </InputOTPSeparator>
                      <InputOTPGroup>
                        <InputOTPSlot className="h-14 w-8 sm:w-12 sm:text-lg" index={2} />
                        <InputOTPSlot className="h-14 w-8 sm:w-12 sm:text-lg" index={3} />
                      </InputOTPGroup>
                      <InputOTPSeparator>
                        <DotIcon className="size-4" />
                      </InputOTPSeparator>
                      <InputOTPGroup>
                        <InputOTPSlot className="h-14 w-8 sm:w-12 sm:text-lg" index={4} />
                        <InputOTPSlot className="h-14 w-8 sm:w-12 sm:text-lg" index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </FormControl>
                <div className="min-h-14">
                  <FormMessage className="mt-6 text-center" />
                </div>
              </FormItem>
            );
          }}
        />

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className={cn(
            'mx-auto w-full max-w-md rounded-xl py-6 text-lg font-normal',
            isSubmitting ? 'cursor-progress' : 'cursor-default'
          )}
        >
          {isSubmitting ? 'Verifying...' : 'Verify'}
        </Button>
      </form>
    </Form>
  );
}
