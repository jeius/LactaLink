import React, { FC } from 'react';

import {
  useHeaderProgress,
  useHeaderScrollHandler,
  useHeaderSize,
} from '@/components/contexts/HeaderProvider';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import ConversationListItem from '@/features/chat/components/ConversationListItem';
import CreateChatButton from '@/features/chat/components/CreateChatButton';
import { conversationsInfiniteOptions } from '@/features/chat/lib/queryOptions';
import { shadow } from '@/lib/utils/shadows';
import { Conversation } from '@lactalink/types/payload-generated-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { PenLineIcon } from 'lucide-react-native';
import Animated, { AnimatedProps, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as FC<
  AnimatedProps<FlashListProps<Conversation>>
>;

const PLACEHOLDERS = generatePlaceHoldersWithID(15, {} as Conversation);
const LIST_HEADER_HEIGHT = 64;

export default function MessagesPage() {
  const scrollHandler = useHeaderScrollHandler();
  const { height: headerHeight } = useHeaderSize();

  const { data, ...query } = useInfiniteQuery(conversationsInfiniteOptions);
  const conversations = data?.pages.flatMap((page) => Array.from(page.docs.values())) || [];

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <Header />
      <AnimatedFlashList
        data={query.isLoading ? PLACEHOLDERS : conversations}
        onScroll={scrollHandler}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmpty}
        overScrollMode={'never'}
        bounces={false}
        refreshControl={
          <RefreshControl
            progressViewOffset={headerHeight + LIST_HEADER_HEIGHT}
            refreshing={query.isRefetching}
            onRefresh={query.refetch}
          />
        }
        contentContainerStyle={{
          paddingBottom: 8,
          paddingTop: headerHeight + LIST_HEADER_HEIGHT + 8,
          flexGrow: 1,
        }}
        renderItem={({ item }) => {
          if (isPlaceHolderData(item)) return <PlaceholderItem />;
          return <ConversationListItem data={item} />;
        }}
      />
    </SafeArea>
  );
}

function Header() {
  const insets = useSafeAreaInsets();
  const { translateY } = useHeaderProgress();
  const { height: headerHeight } = useHeaderSize();

  const translateStyle = useAnimatedStyle(() => {
    const paddingTop = interpolate(
      translateY.value,
      [0, -(headerHeight + insets.top)],
      [headerHeight, 0]
    );
    return { paddingTop };
  });

  return (
    <Animated.View
      className="absolute inset-x-0 top-0 z-10 border-outline-200 bg-background-0"
      style={[shadow.sm, translateStyle, { borderBottomWidth: 1 }]}
    >
      <HStack space="lg" className="items-center px-5 py-4">
        <Text bold size="lg" className="grow">
          Messages
        </Text>
        <CreateChatButton />
      </HStack>
    </Animated.View>
  );
}

function ListEmpty() {
  return (
    <VStack className="grow items-center justify-center px-5">
      <Text size="lg" className="text-center text-typography-700">
        You have no messages yet
      </Text>
      <Link href={'/conversations/create'} push asChild>
        <Button className="mt-4">
          <ButtonIcon as={PenLineIcon} />
          <ButtonText>Start a conversation</ButtonText>
        </Button>
      </Link>
    </VStack>
  );
}

function PlaceholderItem() {
  return (
    <HStack space="md" className="items-center px-5 py-2">
      <Skeleton variant="circular" className="h-14 w-14" />
      <VStack space="xs" className="grow">
        <Skeleton variant="sharp" className="h-6 w-40" />
        <Skeleton variant="sharp" className="h-4" />
      </VStack>
    </HStack>
  );
}
