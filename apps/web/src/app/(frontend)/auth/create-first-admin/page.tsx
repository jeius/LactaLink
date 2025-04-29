import SignUpForm from '@/components/forms/SignUpForm';
import GoogleSignIn from '@/components/GoogleSignIn';
import Logo from '@/components/icons/logo.svg';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getServerSideURL } from '@/lib/utils/getURL';

import config from '@payload-config';
import { Metadata } from 'next';
import NextImage from 'next/image';
import { redirect } from 'next/navigation';

import { getPayload } from 'payload';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Create First Admin | LactaLink',
};

export default async function Page() {
  const payload = await getPayload({ config });
  const admins = await payload.find({
    collection: 'users',
    where: { role: { equals: 'ADMIN' } },
    pagination: false,
    depth: 0,
    select: { email: true },
  });

  if (admins.totalDocs > 0) {
    redirect('/');
  }

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
            <CardTitle className="text-xl font-bold">Welcome to LactaLink 👋</CardTitle>
            <CardDescription>Let&apos;s create the first admin user.</CardDescription>
          </CardHeader>
          <CardContent className="bg-card">
            <Suspense fallback={null}>
              <SignUpForm role={'ADMIN'} />
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
