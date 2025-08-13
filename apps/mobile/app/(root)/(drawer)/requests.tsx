import { BottomSheetActionButton } from '@/components/buttons';
import { ScrollProvider, useScroll } from '@/components/contexts/ScrollProvider';
import SafeArea from '@/components/SafeArea';
import { AvailableRequestsTab } from '@/components/tabs/AvailableRequestsTab';
import { UserRequestsTab } from '@/components/tabs/UserRequestsTab';
import { useAuth } from '@/hooks/auth/useAuth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import { memo } from 'react';

const Tab = memo(
  (props: { hasUser: boolean }) => {
    const { hasUser } = props;
    return hasUser ? <UserRequestsTab /> : <AvailableRequestsTab />;
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
    router.push(`/requests/create`);
  }

  return (
    <SafeArea safeTop={false} safeBottom={false}>
      <Tab hasUser={hasUser} />
      {(isOwner || !hasUser) && (
        <BottomSheetActionButton
          icon={PlusIcon}
          scrollValue={scrollValue}
          animateDistance={200}
          label={`Create New Request`}
          onPress={handleCreateNew}
        />
      )}
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
