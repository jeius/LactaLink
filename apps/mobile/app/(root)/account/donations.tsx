import { BottomSheetActionButton } from '@/components/buttons';
import { ScrollProvider } from '@/components/contexts/ScrollProvider';
import SafeArea from '@/components/SafeArea';
import { UserDonationsTab } from '@/components/tabs/UserDonationsTab';
import { useRouter } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';

function ListPage() {
  const router = useRouter();

  function handleCreateNew() {
    router.push(`/donations/create`);
  }

  return (
    <SafeArea safeTop={false} safeBottom={false}>
      <UserDonationsTab />
      <BottomSheetActionButton
        icon={PlusIcon}
        animateDistance={200}
        label={`Create New Donation`}
        onPress={handleCreateNew}
      />
    </SafeArea>
  );
}

export default function DonationsPage() {
  return (
    <ScrollProvider>
      <ListPage />
    </ScrollProvider>
  );
}
