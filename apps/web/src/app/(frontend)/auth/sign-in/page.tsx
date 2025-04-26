import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Metadata } from 'next';
import Link from 'next/link';
import SignInForm from './form';
import GoogleSignIn from './googleSignIn';

import Logo from '@/components/icons/logo.svg';
import { getServerSideURL } from '@/lib/utils/getURL';
import NextImage from 'next/image';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Sign In | LactaLink',
};

export default function Page() {
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
            <Logo className="h-12 w-16" />
          </div>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Welcome 👋</CardTitle>
            <CardDescription>
              Don&apos;t have an account?
              <Button variant="link" className="text-primary" size={'sm'} asChild>
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
            <div className="flex w-full items-center justify-between gap-4">
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
