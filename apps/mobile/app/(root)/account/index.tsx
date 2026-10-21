import ProfileCard from '@/components/cards/ProfileCard';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Pressable } from '@/components/ui/pressable';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useRevalidateCollectionQueries } from '@/hooks/collections/useRevalidateQueries';
import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';

export default function AccountPage() {
  const router = useRouter();
  const { data: user, refetch, isRefetching, isLoading } = useMeUser();
  const revalidate = useRevalidateCollectionQueries();

  function handleRefetch() {
    refetch();
    revalidate(['users', 'individuals', 'hospitals', 'milkBanks']);
  }

  return (
    <SafeArea safeTop={false} className="items-stretch bg-background-0">
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefetch} />}
        className="flex-1"
        contentContainerClassName="grow bg-background-50"
        showsVerticalScrollIndicator={false}
      >
        <VStack className="items-stretch p-5">
          {user?.profile && (
            <Pressable onPress={() => router.push('/profile')}>
              <ProfileCard
                className="p-0"
                profile={user.profile}
                isLoading={isLoading}
                hideBadge
                disableNavigation
              />
            </Pressable>
          )}
        </VStack>
      </ScrollView>
    </SafeArea>
  );
}
