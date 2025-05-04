import { Protected } from '@/components/protected';
import { Button, ButtonText } from '@/components/ui/button';
import { useSession } from '@/hooks/useSession';
import React from 'react';

export default function Home() {
  const { signOut } = useSession();

  return (
    <Protected>
      <Button
        onPress={() => {
          signOut();
        }}
      >
        <ButtonText>Sign out</ButtonText>
      </Button>
    </Protected>
  );
}
