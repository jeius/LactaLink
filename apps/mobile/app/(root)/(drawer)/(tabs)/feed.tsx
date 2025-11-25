import React, { FC, useCallback } from 'react';

import { useHeaderScrollHandler, useHeaderSize } from '@/components/contexts/HeaderProvider';
import { NearestListingsList } from '@/components/lists/NearestListingsList';
import { DonateRequestModal } from '@/components/modals';
import { NoData } from '@/components/NoData';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { HStack, HStackProps } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import PostItem from '@/features/feed/components/post-item/PostItem';
import { useInfinitePosts } from '@/features/feed/hooks/useInfinitePosts';
import { shadow } from '@/lib/utils/shadows';
import { Post } from '@lactalink/types/payload-generated-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { Link, useRouter } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import Animated, { AnimatedProps } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PLACEHOLDER = generatePlaceHoldersWithID(50, {} as Post);

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as FC<
  AnimatedProps<FlashListProps<Post>>
>;

export default function FeedPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const scrollHandler = useHeaderScrollHandler();
  const { height: headerHeight } = useHeaderSize();

  const { data: posts, queryKey, ...query } = useInfinitePosts();

  const { isLoading, fetchNextPage, hasNextPage, isRefetching, refetch } = query;

  const ListHeader = useCallback(() => {
    return (
      <VStack className="items-stretch gap-2">
        <CTA className="border border-outline-200 bg-background-0 p-4" />
        <NearestListingsList isLoading={isLoading} />
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
        keyExtractor={(item, idx) => `feed-${item.id}-${idx}`}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        bounces={false}
        overScrollMode="never"
        contentContainerClassName="flex-col items-stretch grow"
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        ItemSeparatorComponent={() => <Box className="h-2" />}
        refreshControl={
          <RefreshControl
            progressViewOffset={headerHeight - insets.top}
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        }
        ListHeaderComponentStyle={{ paddingTop: headerHeight - insets.top, marginBottom: 8 }}
        onEndReached={fetchNextPage}
        renderItem={({ item }) => {
          if (isPlaceHolderData(item)) return <PlaceHolderItem />;

          const handlePress = () => router.push(`/feed/${item.id}`);
          return <PostItem post={item} queryKey={queryKey} onPress={handlePress} />;
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
            <Icon as={PlusIcon} size="xl" />
          </Pressable>
        )}
      />
    </HStack>
  );
}

function PlaceHolderItem() {
  return (
    <Card variant="filled" className="h-64 rounded-none p-3">
      <HStack space="sm">
        <Skeleton variant="circular" className="h-10 w-10" />
        <VStack space="xs">
          <Skeleton variant="sharp" className="h-4 w-32" />
          <Skeleton variant="sharp" className="h-4 w-10" />
        </VStack>
      </HStack>
      <VStack space="xs" className="mt-4">
        <Skeleton variant="sharp" className="h-5" />
        <Skeleton variant="sharp" className="h-5" />
        <Skeleton variant="sharp" className="h-5" />
        <Skeleton variant="sharp" className="h-5 w-40" />
      </VStack>
      <HStack space="sm" className="flex-1 items-end">
        <Skeleton variant="rounded" className="mt-4 h-8 w-8" />
        <Skeleton variant="rounded" className="mt-4 h-8 w-8" />
      </HStack>
    </Card>
  );
}

function ListEmpty() {
  return <NoData title="No one has posted yet" />;
}
