import { BottomSheetActionButton } from '@/components/buttons';
import { useScroll } from '@/components/contexts/ScrollProvider';
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

export default function ListPage() {
  const router = useRouter();
  const { userID } = useLocalSearchParams<{ userID?: string }>();
  const { user } = useAuth();
  const { scrolledDown } = useScroll();

  console.log('ScrolledDown:', scrolledDown);

  const hasUser = Boolean(userID);
  const isOwner = user?.id === userID;

  function handleCreateNew() {
    router.push(`/donations/create`);
  }

  return (
    <SafeArea safeTop={false} safeBottom={false}>
      {hasUser ? <UserDonationsTab /> : <AvailableDonationsTab />}
      <BottomSheetActionButton
        show={(isOwner && !scrolledDown) || (!hasUser && !scrolledDown)}
        icon={PlusIcon}
        label={`Create New Donation`}
        onPress={handleCreateNew}
      />
    </SafeArea>
  );
}
