import { HeaderBackButton } from '@/components/HeaderBackButton';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { InfiniteFlashList } from '@/components/ui/list';
import { Pressable } from '@/components/ui/pressable';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { useProfileData } from '@/features/profile/hooks/useProfileData';
import { useUserSearch } from '@/features/user-search/hooks/useUserSearch';
import { getColor } from '@/lib/colors';
import { useCurrentCoordinates } from '@/lib/stores';
import { shadow } from '@/lib/utils/shadows';
import { UserProfile } from '@lactalink/types';
import { extractID } from '@lactalink/utilities/extractors';
import { useMutationState, useQuery } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import { UsersRoundIcon } from 'lucide-react-native';
import { useCreateDirectChat } from '../hooks/mutations';
import { useFindDirectChat } from '../hooks/queries';
import { createDirectChatCreationMutation } from '../lib/mutationOptions';
import { createNearestUsersQueryOptions } from '../lib/queryOptions';
import { CreateConvoSearchParams } from '../lib/types';
import UserProfileItem from './UserProfileItem';
import UserSearchInput from './UserSearchInput';

export default function CreateDirectChat() {
  const coordinates = useCurrentCoordinates();
  const { data: nearestUsers, ...usersQuery } = useQuery(
    createNearestUsersQueryOptions(coordinates)
  );
  const suggestions = nearestUsers?.map((user) => user.profile).filter((v) => !!v);

  const mutationKey = createDirectChatCreationMutation().mutationKey;
  const mutationStates = useMutationState({
    filters: { mutationKey, status: 'pending' },
    select: (m) => m.state,
  });

  const { searchTerm, setSearchTerm, clearSearch, willSearch, searchResults, ...query } =
    useUserSearch();

  const profiles = willSearch ? searchResults.map((s) => s.doc) : suggestions || [];

  return (
    <SafeArea className="items-stretch">
      <Box
        className="border-outline-200 bg-background-50"
        style={[shadow.sm, { borderBottomWidth: 1 }]}
      >
        <HStack space="xs" className="items-center gap-4 p-2">
          <HeaderBackButton tintColor={getColor('typography', '900')} />
          <Text bold size="lg">
            New Message
          </Text>
        </HStack>

        <HStack space="md" className="items-center px-5">
          <Text>To:</Text>
          <UserSearchInput
            variant="underlined"
            className="my-2 grow bg-transparent"
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={clearSearch}
            isLoading={query.isFetching}
          />
        </HStack>
      </Box>

      <InfiniteFlashList
        {...query}
        data={profiles}
        emptyListLabel="No users found..."
        headerClassName="mb-1"
        renderItem={({ item }) => <ListItem data={item} />}
        ListHeaderComponent={<ListHeader isLoading={usersQuery.isLoading} />}
      />

      <FetchingSpinner isFetching={mutationStates.length > 0} />
    </SafeArea>
  );
}

function ListHeader({ isLoading }: { isLoading?: boolean }) {
  const params: CreateConvoSearchParams = { type: 'group' };
  return (
    <>
      <Link href={{ pathname: '/conversations/create', params }} push asChild>
        <Pressable className="flex-row items-center gap-2 p-5">
          <Icon as={UsersRoundIcon} />
          <Text className="font-JakartaSemiBold">Group Chat</Text>
        </Pressable>
      </Link>
      <Text size="sm" className="mx-5 mt-2 font-JakartaMedium text-typography-700">
        Suggested
      </Text>
      {isLoading && <Spinner size={'large'} style={{ marginTop: 32 }} />}
    </>
  );
}

function ListItem({ data }: { data: UserProfile }) {
  const router = useRouter();
  const { data: profile, isLoading } = useProfileData(data);
  const owner = profile?.value?.owner;
  const { data: conversation } = useFindDirectChat(owner);
  const { mutateAsync: createChat } = useCreateDirectChat();

  const handlePress = async () => {
    if (conversation) {
      router.replace(`/chat/${extractID(conversation)}`);
    } else if (owner) {
      const createdConvo = await createChat(owner);
      router.replace(`/chat/${extractID(createdConvo)}`);
    }
  };

  if (isLoading || !profile) {
    return (
      <HStack space="sm" className="items-center px-5 py-4">
        <Skeleton variant="circular" className="h-12 w-12" />
        <Skeleton variant="sharp" className="h-5 w-32" />
      </HStack>
    );
  }

  return (
    <Pressable className="px-5 py-4" onPress={handlePress}>
      <UserProfileItem profile={profile} />
    </Pressable>
  );
}
