import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Metadata } from 'next';

import { Button } from '@/components/ui/button';
import { SEARCH_PARAMS_KEYS } from '@/lib/constants/routes';
import { encodedRedirect } from '@/lib/utils/encodedRedirect';
import { getServerSideURL } from '@/lib/utils/getURL';
import { VerifyOtpParams } from '@supabase/supabase-js';
import { ChevronLeft } from 'lucide-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import OTPForm from './form';
import SendAgain from './sendAgain';

export const metadata: Metadata = {
  title: 'Verify OTP | LactaLink',
  description: 'Verify OTP page for LactaLink',
};

const redirectKey = SEARCH_PARAMS_KEYS.REDIRECT;

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function Page({ searchParams }: Props) {
  const { email, type, redirect, phone } = await searchParams;
  const otpType = type as VerifyOtpParams['type'];

  if (!type) {
    const msg = 'Unable to send verification code, verification type not provided.';
    encodedRedirect('/error', msg);
  }

  return (
    <main className="min-h-[calc(100vh - 2rem)] p-5">
      <div className="container mx-auto mt-5 flex max-w-lg flex-col gap-2 lg:mt-10 lg:max-w-4xl">
        <Button
          variant={'link'}
          className="text-muted-foreground hover:text-foreground size-fit p-2 hover:no-underline"
          asChild
        >
          <Link
            href={`${getServerSideURL()}/auth/sign-in?${redirect ? `?${redirectKey}=${redirect}` : ''}`}
          >
            <ChevronLeft /> Back to sign in
          </Link>
        </Button>
        <Card className="relative items-end gap-0 overflow-hidden p-0 lg:flex-row">
          <div className="relative h-40 w-full overflow-clip lg:h-full">
            <NextImage
              src={`${getServerSideURL()}/images/verification.png`}
              alt="Phone verification"
              width={1080}
              height={1080}
              className="size-full object-cover object-center"
            />
          </div>

          <div className="from-primary-100 absolute inset-0 bg-gradient-to-t opacity-30" />

          <div className="lg:w-xl bg-card z-10 flex w-full flex-col gap-6 py-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Verify your account</CardTitle>
              <CardDescription>
                A six digit code has been sent to <strong>{email}.</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-6">
              <Suspense fallback={null}>
                <OTPForm email={email} type={otpType} phone={phone} />
              </Suspense>
            </CardContent>
            <CardFooter className="mt-8 flex flex-col items-center justify-center">
              <p className="text-muted-foreground text-sm">
                Didn&apos;t receive the verification code?
              </p>
              <SendAgain email={email} type={otpType} phone={phone} />
            </CardFooter>
          </div>
        </Card>
      </div>
    </main>
  );
}
