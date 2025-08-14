import { BottomSheetActionButton } from '@/components/buttons';
import { ScrollProvider, useScroll } from '@/components/contexts/ScrollProvider';
import SafeArea from '@/components/SafeArea';
import { UserRequestsTab } from '@/components/tabs/UserRequestsTab';
import { useRouter } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';

function ListPage() {
  const router = useRouter();
  const { scrollValue } = useScroll();

  function handleCreateNew() {
    router.push(`/requests/create`);
  }

  return (
    <SafeArea safeTop={false} safeBottom={false}>
      <UserRequestsTab />
      <BottomSheetActionButton
        icon={PlusIcon}
        scrollValue={scrollValue}
        animateDistance={200}
        label={`Create New Request`}
        onPress={handleCreateNew}
      />
    </SafeArea>
  );
}

export default function RequestsPage() {
  return (
    <ScrollProvider>
      <ListPage />
    </ScrollProvider>
  );
}
