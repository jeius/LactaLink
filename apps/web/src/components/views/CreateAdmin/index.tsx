import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getServerSideURL } from '@/lib/utils/getURL';
import { redirect } from 'next/navigation';
import { AdminViewServerProps, CollectionSlug } from 'payload';

import SignUpForm from './index.client';
import './style.scss';

export default async function CreateAdmin({ initPageResult, user }: AdminViewServerProps) {
  const redirectUrl = `${getServerSideURL()}/admin`;
  if (user) {
    redirect(redirectUrl);
  }

  const {
    req,
    req: { payload },
    req: {
      payload: {
        collections,
        config: {
          admin: { user: userSlug },
        },
      },
    },
  } = initPageResult;

  const userDocs = await payload.find({
    collection: userSlug as CollectionSlug,
    pagination: false,
  });

  if (userDocs.totalDocs > 0) {
    redirect(redirectUrl);
  }

  return (
    <main className="min-h-[calc(100vh - 2rem)] p-5">
      <div className="container mx-auto mt-20 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-5xl">Welcome</CardTitle>
            <CardDescription className="text-xl">Create the first admin user.</CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
