'use client';

import { googleSignIn } from '@/auth/actions';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function GoogleSignIn() {
  async function handleSignIn() {
    const res = await googleSignIn();

    if (res.error) {
      toast(res.error.message, { className: 'bg-destructive', dismissible: true });
      return;
    }
  }
  return (
    <Button
      variant={'outline'}
      className="text-primary hover:bg-primary-300 border-primary dark:border-primary dark:hover:border-foreground mt-4 w-full max-w-md rounded-xl bg-transparent py-6 text-lg font-normal"
      size="lg"
      onClick={handleSignIn}
    >
      Google
    </Button>
  );
}
