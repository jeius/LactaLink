import { Protected } from '@/components/protected';
import { useTheme } from '@/components/providers/theme-provider';
import ThemeToggler from '@/components/theme-toggler';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { useSession } from '@/hooks/useSession';
import { errorToast, loadingToast, successToast } from '@/lib/toaster';
import { LogOutIcon } from 'lucide-react-native';
import React from 'react';

export default function Home() {
  const { signOut } = useSession();
  const toast = useToast();
  const { theme } = useTheme();

  function showLoadingToast() {
    toast.show({
      id: 'sample-loading',
      duration: null,
      render: ({ id }) => loadingToast(id, 'Sample loading...', theme),
    });
  }

  function showErrorToast() {
    toast.show({
      id: 'sample-error',
      duration: null,
      render: ({ id }) => errorToast(id, 'Sample error'),
    });
  }

  function showSuccessToast() {
    toast.show({
      id: 'sample-success',
      duration: null,
      render: ({ id }) => successToast(id, 'Sample success'),
    });
  }

  return (
    <Protected className="bg-background-50 relative flex-1">
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

        <Button variant="outline" action="default" onPress={showLoadingToast}>
          <ButtonText>Show Loading</ButtonText>
        </Button>

        <Button variant="outline" action="negative" onPress={showErrorToast}>
          <ButtonText>Show Error</ButtonText>
        </Button>

        <Button variant="outline" action="positive" onPress={showSuccessToast}>
          <ButtonText>Show Success</ButtonText>
        </Button>

        <Button variant="outline" action="secondary" onPress={() => toast.closeAll()}>
          <ButtonText>Close all</ButtonText>
        </Button>
      </VStack>
    </Protected>
  );
}
