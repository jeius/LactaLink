import SignUpForm from '@/components/forms/SignUpForm';
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
  title: 'Create Account | LactaLink',
};

export default function Page() {
  return (
    <main className="min-h-[calc(100vh - 2rem)] p-5">
      <div className="container mx-auto mt-5 max-w-lg lg:mt-10 lg:max-w-4xl">
        <Card className="overflow-hidden rounded-2xl bg-transparent p-0 pb-10">
          <div className="relative h-40 w-full overflow-clip p-4">
            <NextImage
              src={`${getServerSideURL()}/images/sign-in.png`}
              alt="Mother Breastfeeding"
              width={1080}
              height={1080}
              className="absolute inset-0 -top-32 -z-10 bg-cover"
            />
            <div className="from-primary absolute inset-0 bg-gradient-to-t opacity-30" />
            <Logo className="z-20 h-12 w-16" />
          </div>
          <CardHeader className="bg-card">
            <CardTitle className="text-xl font-bold">Create your account 👋</CardTitle>
            <CardDescription>
              Already have an account?
              <Button variant="link" className="text-primary" size={'sm'} asChild>
                <Link href={'/auth/sign-in'}>Sign in</Link>
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-card">
            <Suspense fallback={null}>
              <SignUpForm />
            </Suspense>
          </CardContent>
          <CardFooter className="bg-card flex flex-col items-center justify-center">
            <div className="flex w-full max-w-md items-center justify-between gap-4">
              <div className="bg-border h-[1px] w-full"></div>
              <span className="text-muted-foreground whitespace-nowrap text-xs">
                OR CONTINUE WITH
              </span>
              <div className="bg-border h-[1px] w-full"></div>
            </div>
            <GoogleSignIn />
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
