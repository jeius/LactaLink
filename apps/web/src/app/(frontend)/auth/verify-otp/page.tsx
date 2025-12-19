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
import Image from '@/components/ui/image';
import { encodedRedirect } from '@/lib/utils/encodedRedirect';
import { getServerSideURL } from '@/lib/utils/getURL';
import { VerifyOtp, VerifyOtpSearchParams } from '@lactalink/types/auth';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import OTPForm from './form';
import SendAgain from './sendAgain';

export const metadata: Metadata = {
  title: 'Verify OTP | LactaLink',
  description: 'Verify OTP page for LactaLink',
};

interface Props {
  searchParams?: Promise<VerifyOtpSearchParams>;
}

export default async function Page({ searchParams }: Props) {
  const backToSignIn = new URL('/auth/sign-in', getServerSideURL());
  const imgUrl = new URL('/images/verification.png', getServerSideURL());

  const params = searchParams && (await searchParams);

  if (!params) {
    notFound();
  }

  if (!params.type) {
    const msg = 'Unable to send verification code, verification type not provided.';
    encodedRedirect('/error', msg);
  }

  if (!('email' in params) && !('phone' in params)) {
    const msg = 'Unable to send verification code, email or phone not provided.';
    encodedRedirect('/error', msg);
    return null;
  }

  if ('email' in params && 'phone' in params) {
    const msg = 'Unable to send verification code, either email or phone must only be provided.';
    encodedRedirect('/error', msg);
    return null;
  }

  const recepient = 'email' in params ? params.email : params.phone;
  const options: VerifyOtp =
    'email' in params
      ? { email: params.email, type: params.type }
      : { phone: params.phone, type: params.type };

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
            <Image
              src={imgUrl.toString()}
              alt="Phone verification"
              width={1080}
              height={1080}
              className="size-full object-cover object-center"
            />
          </div>

          <div className="from-primary-100 absolute inset-0 bg-gradient-to-t opacity-30" />

          <div className="bg-card z-10 flex w-full flex-col gap-6 py-8 lg:w-xl">
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
