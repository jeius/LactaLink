import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | LactaLink',
};

export default function Page() {
  return (
    <main className="min-h-[calc(100vh - 2rem)] p-5">
      <div className="container mx-auto mt-20 max-w-4xl">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Create new account</CardTitle>
            <CardDescription>
              Already have an account?
              <Button variant="link" className="text-primary">
                Sign in
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
      </div>
    </main>
  );
}
