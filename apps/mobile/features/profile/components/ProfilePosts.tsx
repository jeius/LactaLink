import { RefreshControl } from '@/components/RefreshControl';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import PostItem from '@/features/feed/components/post-item/PostItem';
import PostPlaceholderItem from '@/features/feed/components/post-item/PostPlaceholderItem';
import { useInfiniteUserPosts } from '@/features/profile/hooks/queries';
import { getMeUser } from '@/lib/stores/meUserStore';
import { PopulatedUserProfile } from '@lactalink/types';
import { Post } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles, isPlaceHolderData } from '@lactalink/utilities/checkers';
import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Link, useRouter } from 'expo-router';
import { useCallback } from 'react';

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
  const router = useRouter();
  const meUser = getMeUser();
  const isMeUser = isEqualProfiles(meUser?.profile, profile);

  const { data: posts, ...postsQuery } = useInfiniteUserPosts(profile);

  const renderItem: ListRenderItem<Post> = useCallback(
    ({ item }) => {
      if (isPlaceHolderData(item)) return <PostPlaceholderItem />;

      const handlePress = () => router.push(`/feed/${item.id}`);
      return <PostItem post={item} onPress={handlePress} />;
    },
    [router]
  );

  const renderHeader = useCallback(() => {
    return (
      <>
        <HeaderComponent profile={profile} />
        <Text size="xl" bold className="bg-background-50 px-4 py-2">
          Posts
        </Text>
      </>
    );
  }, [HeaderComponent, profile]);

  const renderListEmpty = useCallback(() => {
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
  }, [isMeUser]);

  return (
    <FlashList
      data={posts}
      renderItem={renderItem}
      keyExtractor={listKeyExtractor}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderListEmpty}
      ListFooterComponent={() =>
        postsQuery.isFetchingNextPage && <Spinner size={'small'} className="my-4" />
      }
      contentContainerStyle={{ paddingBottom: 16 }}
      ItemSeparatorComponent={() => <Box className="h-1" />}
      refreshControl={<RefreshControl refreshing={isRefreshing ?? false} onRefresh={onRefresh} />}
      onEndReached={postsQuery.fetchNextPage}
      onEndReachedThreshold={0.25}
    />
  );
}
