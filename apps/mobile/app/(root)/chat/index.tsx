import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import ConversationListItem from '@/features/chat/components/ConversationListItem';
import { useInfiniteConversations } from '@/features/chat/hooks/queries';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { FlashList } from '@shopify/flash-list';
import { Link, useRouter } from 'expo-router';
import { PenLineIcon } from 'lucide-react-native';

export default function ChatsPage() {
  const router = useRouter();

  const { data: conversations, ...query } = useInfiniteConversations();

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <FlashList
        data={conversations}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmpty}
        overScrollMode={'never'}
        bounces={false}
        refreshControl={
          <RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} />
        }
        contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
        renderItem={({ item }) => {
          if (isPlaceHolderData(item)) return <PlaceholderItem />;
          return <ConversationListItem data={item} />;
        }}
      />
    </SafeArea>
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
