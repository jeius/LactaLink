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
import { VerifyOTP } from '@lactalink/types';
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
  searchParams?: Promise<{ redirect?: string } | Omit<VerifyOTP, 'options'>>;
}

export default async function Page({ searchParams }: Props) {
  const params = (searchParams && (await searchParams)) || {};

  const redirect = ('redirect' in params && params.redirect) || null;
  const backToSignIn = new URL('/auth/sign-in', getServerSideURL());
  if (redirect) {
    backToSignIn.searchParams.set(redirectKey, redirect);
  }

  const imgUrl = new URL('/images/verification.png', getServerSideURL());

  if (!('type' in params)) {
    const msg = 'Unable to send verification code, verification type not provided.';
    encodedRedirect('/error', msg);
    return null;
  }

  const type = params.type;
  const email = 'email' in params && typeof params.email === 'string' ? params.email : undefined;
  const phone = 'phone' in params && typeof params.phone === 'string' ? params.phone : undefined;
  const recepient = email || phone;

  if (!recepient) {
    const msg = 'Unable to send verification code, email or phone not provided.';
    encodedRedirect('/error', msg);
    return null;
  }

  let options: VerifyOTP | null = null;

  if (email && (type === 'recovery' || type === 'signup' || type === 'email_change')) {
    options = { email, type };
  } else if (phone && (type === 'phone_change' || type === 'sms')) {
    options = { phone, type };
  }

  if (!options) {
    const msg = 'Unable to send verification code, invalid parameters provided.';
    encodedRedirect('/error', msg);
    return null;
  }

  return (
    <main className="min-h-[calc(100vh - 2rem)] p-5">
      <div className="container mx-auto mt-5 flex max-w-lg flex-col gap-2 lg:mt-10 lg:max-w-4xl">
        <Button
          variant={'link'}
          className="text-muted-foreground hover:text-foreground size-fit p-2 hover:no-underline"
          asChild
        >
          <Link href={backToSignIn.toString()}>
            <ChevronLeft /> Back to sign in
          </Link>
        </Button>
        <Card className="relative items-end gap-0 overflow-hidden p-0 lg:flex-row">
          <div className="relative h-40 w-full overflow-clip lg:h-full">
            <NextImage
              src={imgUrl.toString()}
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
                A six digit code has been sent to <strong>{recepient}.</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-6">
              <Suspense fallback={null}>
                <OTPForm {...options} />
              </Suspense>
            </CardContent>
            <CardFooter className="mt-8 flex flex-col items-center justify-center">
              <p className="text-muted-foreground text-sm">
                Didn&apos;t receive the verification code?
              </p>
              <SendAgain {...options} />
            </CardFooter>
          </div>
        </Card>
      </div>
    </main>
  );
}
