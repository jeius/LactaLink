'use client';

import { googleSignIn } from '@/auth/operations/signIn';
import { Button } from '@/components/ui/button';

export default function GoogleSignIn() {
  return (
    <Button
      variant={'outline'}
      className="text-primary hover:bg-primary-300 border-primary mt-4 w-full max-w-md rounded-full bg-transparent py-6 text-lg font-normal"
      size="lg"
      onClick={googleSignIn}
    >
      Google
    </Button>
  );
}
