import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Metadata } from 'next';

import { getCurrentUser } from '@/auth/actions/getCurrentUser';
import { getServerSideURL } from '@/lib/utils/getURL';
import NextImage from 'next/image';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import OTPForm from './form';
import SendAgain from './sendAgain';

export const metadata: Metadata = {
  title: 'Verify OTP | LactaLink',
  description: 'Verify OTP page for LactaLink',
};

export default async function Page() {
  const { user } = (await getCurrentUser()) ?? {};

  if (!user) {
    redirect(`${getServerSideURL()}/auth/sign-in`);
  }
  const email = user.email;
  const isEmailConfirmed = Boolean(user.emailConfirmedAt);

  if (isEmailConfirmed) {
    redirect(`${getServerSideURL()}`);
  }

  return (
    <main className="min-h-[calc(100vh - 2rem)] p-5">
      <div className="container mx-auto mt-20 max-w-4xl">
        <Card className="overflow-hidden rounded-2xl p-0 pb-10">
          <div className="bg-background-100 relative h-40 w-full overflow-clip p-4">
            <NextImage
              src={`${getServerSideURL()}/images/sign-in.png`}
              alt="Mother Breastfeeding"
              width={1080}
              height={1080}
              className="absolute inset-0 -top-32 bg-cover"
            />
            <div className="from-primary absolute inset-0 bg-gradient-to-t opacity-30" />
          </div>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Verify your account</CardTitle>
            <CardDescription>
              A six digit code has been sent to <strong>{email}.</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-6">
            <Suspense fallback={null}>
              <OTPForm />
            </Suspense>
          </CardContent>
          <CardFooter className="mt-8 flex flex-col items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Didn&apos;t receive the verification code?
            </p>
            <SendAgain email={email} />
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
