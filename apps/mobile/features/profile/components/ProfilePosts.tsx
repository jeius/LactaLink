import { Button, ButtonText } from '@/components/ui/button';
import { InfiniteFlashList } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import PostItem from '@/features/feed/components/post-item/PostItem';
import PostPlaceholderItem from '@/features/feed/components/post-item/PostPlaceholderItem';
import { useInfiniteUserPosts } from '@/features/profile/hooks/queries';
import { getMeUser } from '@/lib/stores/meUserStore';
import { PopulatedUserProfile } from '@lactalink/types';
import { Post } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { Link, useRouter } from 'expo-router';
import { PropsWithChildren, useCallback } from 'react';

export interface PostListProps<T extends PopulatedUserProfile> {
  profile: T;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  HeaderComponent: React.FC<{ profile: T }>;
}

export default function ProfilePosts<T extends PopulatedUserProfile>({
  profile,
  isRefreshing,
  onRefresh,
  HeaderComponent,
}: PostListProps<T>) {
  const meUser = getMeUser();
  const isMeUser = isEqualProfiles(meUser?.profile, profile);

  const { data: posts, ...postsQuery } = useInfiniteUserPosts(profile);
  const refreshing = isRefreshing || postsQuery.isRefetching;
  const handleRefresh = useCallback(() => {
    onRefresh?.();
    postsQuery.refetch();
  }, [onRefresh, postsQuery]);

  return (
    <InfiniteFlashList
      {...postsQuery}
      gap={4}
      data={posts}
      contentContainerClassName="pb-4"
      refreshing={refreshing}
      onRefresh={handleRefresh}
      keyExtractor={listKeyExtractor}
      renderItem={({ item, isPlaceholder }) => (
        <RenderItem item={item} isPlaceholder={isPlaceholder} />
      )}
      ListEmptyComponent={<EmptyState isMeUser={isMeUser} />}
      ListHeaderComponent={
        <ListHeader>
          <HeaderComponent profile={profile} />
        </ListHeader>
      }
    />
  );
}

function ListHeader({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <Text size="xl" bold className="bg-background-50 px-4 py-2">
        Posts
      </Text>
    </>
  );
}

function RenderItem({ item, isPlaceholder }: { item: Post; isPlaceholder: boolean }) {
  const router = useRouter();
  const handlePress = () => router.push(`/feed/${item.id}`);

  if (isPlaceholder) return <PostPlaceholderItem />;
  return <PostItem post={item} onPress={handlePress} />;
}

function EmptyState({ isMeUser }: { isMeUser: boolean }) {
  return (
    <VStack space="lg" className="items-center justify-center p-5">
      <Text className="mt-10 text-typography-700">
        {isMeUser ? "You haven't posted anything yet." : 'This user has not posted anything yet.'}
      </Text>
      {isMeUser && (
        <Link asChild push href={{ pathname: '/feed/create' }}>
          <Button>
            <ButtonText>Create Post</ButtonText>
          </Button>
        </Link>
      )}
    </VStack>
  );
}
