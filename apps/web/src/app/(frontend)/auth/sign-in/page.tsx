import SignInForm from '@/components/forms/sign-in';
import GoogleSignIn from '@/components/GoogleSignIn';
import Logo from '@/components/icons/logo.svg';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getServerSideURL } from '@/lib/utils/getURL';

import { Metadata } from 'next';
import NextImage from 'next/image';
import Link from 'next/link';

import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Sign In | LactaLink',
};

export default function Page() {
  return (
    <main className="min-h-[calc(100vh - 2rem)] p-5">
      <div className="container mx-auto mt-5 max-w-lg lg:mt-10 lg:max-w-4xl">
        <Card className="relative items-end gap-0 overflow-hidden p-0 lg:flex-row">
          <div className="relative h-40 w-full overflow-clip lg:h-full">
            <NextImage
              src={`${getServerSideURL()}/images/sign-in.png`}
              alt="Mother Breastfeeding"
              width={1080}
              height={1080}
              className="size-full object-cover object-top"
            />
          </div>

          <div className="from-primary-100 absolute inset-0 bg-gradient-to-t opacity-30" />
          <Logo className="absolute left-5 top-5 h-12 w-16" />

          <div className="lg:w-xl bg-card z-10 flex w-full flex-col gap-6 py-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Welcome 👋</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-x-2">
                Don&apos;t have an account?
                <Button variant="link" className="px-0" size={'sm'} asChild>
                  <Link href={'/auth/sign-up'}>Create account</Link>
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={null}>
                <SignInForm />
              </Suspense>
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center">
              <div className="flex w-full max-w-md items-center justify-between gap-4">
                <div className="bg-border h-[1px] w-full"></div>
                <span className="text-muted-foreground whitespace-nowrap text-xs">
                  OR CONTINUE WITH
                </span>
                <div className="bg-border h-[1px] w-full"></div>
              </div>
              <GoogleSignIn />
            </CardFooter>
          </div>
        </Card>
      </div>
    </main>
  );
}
