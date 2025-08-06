import { BottomSheetActionButton } from '@/components/buttons';
import { useScroll } from '@/components/contexts/ScrollProvider';
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

export default function ListPage() {
  const router = useRouter();
  const { userID } = useLocalSearchParams<{ userID?: string }>();
  const { user } = useAuth();
  const { scrolledDown } = useScroll();

  const hasUser = Boolean(userID);
  const isOwner = user?.id === userID;

  function handleCreateNew() {
    router.push(`/requests/create`);
  }

  return (
    <SafeArea safeTop={false} safeBottom={false}>
      <Tab hasUser={hasUser} />
      <BottomSheetActionButton
        show={(isOwner && !scrolledDown) || !hasUser}
        icon={PlusIcon}
        label={`Create New Request`}
        onPress={handleCreateNew}
      />
    </SafeArea>
  );
}
