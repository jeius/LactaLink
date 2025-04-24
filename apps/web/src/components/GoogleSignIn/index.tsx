'use client';
import { googleSignIn } from '@/auth/operations/signIn';
import { Button } from '@/components/ui/button';

export default function GoogleSignIn() {
  async function handleSignIn() {
    await googleSignIn();
  }
  return (
    <Button className="bg-primary w-full border-0" onClick={handleSignIn} type="button">
      Sign in with Google
    </Button>
  );
}
