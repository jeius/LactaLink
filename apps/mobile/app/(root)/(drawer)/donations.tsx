import { BottomSheetActionButton } from '@/components/buttons';
import { ScrollProvider, useScroll } from '@/components/contexts/ScrollProvider';
import SafeArea from '@/components/SafeArea';
import { AvailableDonationsTab } from '@/components/tabs/AvailableDonationsTab';
import { UserDonationsTab } from '@/components/tabs/UserDonationsTab';
import { useAuth } from '@/hooks/auth/useAuth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import { memo } from 'react';

const Tab = memo(
  (props: { hasUser: boolean }) => {
    const { hasUser } = props;
    return hasUser ? <UserDonationsTab /> : <AvailableDonationsTab />;
  },
  (prevProps, nextProps) => prevProps.hasUser === nextProps.hasUser
);
Tab.displayName = 'Tab';

function ListPage() {
  const router = useRouter();
  const { userID } = useLocalSearchParams<{ userID?: string }>();
  const { user } = useAuth();
  const { scrollValue } = useScroll();

  const hasUser = Boolean(userID);
  const isOwner = user?.id === userID;

  function handleCreateNew() {
    router.push(`/donations/create`);
  }

  return (
    <SafeArea safeTop={false} safeBottom={false}>
      <Tab hasUser={hasUser} />
      {(isOwner || !hasUser) && (
        <BottomSheetActionButton
          icon={PlusIcon}
          scrollValue={scrollValue}
          animateDistance={200}
          label={`Create New Donation`}
          onPress={handleCreateNew}
        />
      )}
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
