import React, { FC } from 'react';

import { AnimatedPressable } from '@/components/animated/pressable';
import { useHeaderScrollHandler, useHeaderSize } from '@/components/contexts/HeaderProvider';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import ConversationListItem from '@/features/chat/components/ConversationListItem';
import { conversationsInfiniteOptions } from '@/features/chat/lib/queryOptions';
import { Conversation } from '@lactalink/types/payload-generated-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { PenLineIcon, PlusIcon } from 'lucide-react-native';
import Animated, { AnimatedProps } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as FC<
  AnimatedProps<FlashListProps<Conversation>>
>;

const PLACEHOLDERS = generatePlaceHoldersWithID(15, {} as Conversation);

export default function MessagesPage() {
  const scrollHandler = useHeaderScrollHandler();
  const insets = useSafeAreaInsets();
  const { height: headerHeight } = useHeaderSize();

  const { data, ...query } = useInfiniteQuery(conversationsInfiniteOptions);
  const conversations = data?.pages.flatMap((page) => Array.from(page.docs.values())) || [];

  return (
    <SafeArea className="items-stretch">
      <AnimatedFlashList
        data={query.isLoading ? PLACEHOLDERS : conversations}
        onScroll={scrollHandler}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        overScrollMode={'never'}
        bounces={false}
        contentContainerStyle={{
          paddingBottom: 80,
          marginTop: headerHeight - insets.top,
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

function ListHeader() {
  return (
    <Box>
      <HStack space="lg" className="items-center px-5 py-4">
        <Text bold size="lg" className="grow">
          Messages
        </Text>
        <Link href={'/conversations/create'} push asChild>
          <AnimatedPressable>
            <Icon size="xl" as={PlusIcon} />
          </AnimatedPressable>
        </Link>
      </HStack>
      <Divider />
    </Box>
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
