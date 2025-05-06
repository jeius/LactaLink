import { Protected } from '@/components/protected';
import { useTheme } from '@/components/providers/theme-provider';
import { Button, ButtonText } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { useSession } from '@/hooks/useSession';
import { loadingToast } from '@/lib/toaster';
import React from 'react';

export default function Home() {
  const { signOut } = useSession();
  const toast = useToast();
  const { theme } = useTheme();

  function showToast() {
    toast.show({
      id: 'sample-loading',
      render: ({ id }) => loadingToast(id, 'Sample loading...', theme),
    });
  }

  return (
    <Protected>
      <VStack space="md">
        <Button
          onPress={() => {
            signOut();
          }}
        >
          <ButtonText>Sign out</ButtonText>
        </Button>

        <Button variant="outline" onPress={showToast}>
          <ButtonText>Show Toast</ButtonText>
        </Button>
      </VStack>
    </Protected>
  );
}
