import React, { FC, useCallback } from 'react';

import { useHeaderScrollHandler, useHeaderSize } from '@/components/contexts/HeaderProvider';
import { DonateRequestModal } from '@/components/modals';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { FlashList, FlashListProps } from '@/components/ui/FlashList';
import { HStack, HStackProps } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import FeedNearestListings from '@/features/donation&request/components/lists/FeedNearestListings';
import PostItem from '@/features/feed/components/post-item/PostItem';
import PostPlaceholderItem from '@/features/feed/components/post-item/PostPlaceholderItem';
import { useInfinitePosts } from '@/features/feed/hooks/useInfinitePosts';
import { shadow } from '@/lib/utils/shadows';
import { Post } from '@lactalink/types/payload-generated-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { Link, useRouter } from 'expo-router';
import { PackagePlusIcon } from 'lucide-react-native';
import Animated, { AnimatedProps } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PLACEHOLDER = generatePlaceHoldersWithID(50, {} as Post);

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as FC<
  AnimatedProps<FlashListProps<Post>>
>;

export default function FeedTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const scrollHandler = useHeaderScrollHandler();
  const { height: headerHeight } = useHeaderSize();

  const { data: posts, ...query } = useInfinitePosts();

  const { isLoading, fetchNextPage, hasNextPage, isRefetching, refetch } = query;

  const ListHeader = useCallback(() => {
    return (
      <VStack className="items-stretch gap-2">
        <CTA className="border border-outline-200 bg-background-0 p-4" />
        <FeedNearestListings isLoading={isLoading} />
      </VStack>
    );
  }, [isLoading]);

  const ListFooter = useCallback(() => {
    if (hasNextPage) return <Spinner size={'small'} className="mt-2" />;
    return (
      <Box className="mt-4 p-4">
        <Text size="sm" className="text-center text-typography-600">
          You have reached the end of the feed.
        </Text>
      </Box>
    );
  }, [hasNextPage]);

  return (
    <SafeArea className="items-stretch">
      <AnimatedFlashList
        data={isLoading ? PLACEHOLDER : (posts ?? [])}
        keyExtractor={listKeyExtractor}
        onScroll={scrollHandler}
        bounces={false}
        overScrollMode="never"
        contentContainerClassName="grow"
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        ItemSeparatorComponent={() => <Box className="h-2" />}
        progressViewOffset={headerHeight - insets.top}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListHeaderComponentStyle={{ paddingTop: headerHeight - insets.top, marginBottom: 8 }}
        onEndReached={fetchNextPage}
        renderItem={({ item }) => {
          if (isPlaceHolderData(item)) return <PostPlaceholderItem />;

          const handlePress = () => router.push(`/feed/${item.id}`);
          return <PostItem post={item} onPress={handlePress} />;
        }}
      />
    </SafeArea>
  );
}

function CTA(props: HStackProps) {
  return (
    <HStack {...props} space="sm" style={shadow.sm}>
      <Link asChild push href={'/feed/create'}>
        <Pressable className="flex-1 flex-row items-center overflow-hidden rounded-full border border-outline-500 px-3 py-2">
          <Text className="font-JakartaMedium text-typography-600">Say something...</Text>
        </Pressable>
      </Link>

      <DonateRequestModal
        trigger={(props) => (
          <Pressable {...props} hitSlop={8} className="overflow-hidden rounded-full p-2">
            <Icon as={PackagePlusIcon} size="xl" />
          </Pressable>
        )}
      />
    </HStack>
  );
}

function ListEmpty() {
  return (
    <VStack space="lg" className="flex-1 items-center justify-center p-4">
      <Text size="lg" className="text-center text-typography-600">
        No posts yet. Be the first to share something with the community!
      </Text>
      <Link asChild push href={'/feed/create'}>
        <Button size="lg">
          <ButtonText>Create Post</ButtonText>
        </Button>
      </Link>
    </VStack>
  );
}
