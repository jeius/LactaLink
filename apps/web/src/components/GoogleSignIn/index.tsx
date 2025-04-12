'use client';
import { useRouter } from 'next/navigation';
import { adminClient } from 'payload-auth-plugin/client';
import { Button } from '../ui/button';

const { signin } = adminClient();

export default function GoogleSignIn() {
  const router = useRouter();
  async function handleSignIn() {
    const { message, isSuccess, isError } = await signin().oauth('google');
    if (isError) {
      console.log(message);
    }
    if (isSuccess) {
      router.push('/admin');
    }
  }
  return (
    <Button onClick={handleSignIn} type="button" className="w-full">
      Sign in with Google
    </Button>
  );
}
