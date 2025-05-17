import { Protected } from '@/components/protected';
import ThemeToggler from '@/components/theme-toggler';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { useSession } from '@/hooks/auth/useSession';
import { LogOutIcon } from 'lucide-react-native';
import React from 'react';

export default function Home() {
  const { signOut } = useSession();

  return (
    <Protected>
      <ThemeToggler />
      <VStack space="md" className="items-center">
        <Button
          action="default"
          onPress={() => {
            signOut();
          }}
        >
          <ButtonText>Sign out</ButtonText>
          <ButtonIcon as={LogOutIcon} />
        </Button>
      </VStack>
    </Protected>
  );
}
