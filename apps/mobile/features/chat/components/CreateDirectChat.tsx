import { HeaderBackButton } from '@/components/HeaderBackButton';
import { NoData } from '@/components/NoData';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { useUserSearch } from '@/features/user-search/hooks/useUserSearch';
import { getColor } from '@/lib/colors';
import { useCurrentCoordinates } from '@/lib/stores';
import { shadow } from '@/lib/utils/shadows';
import { extractID } from '@lactalink/utilities/extractors';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { UsersRoundIcon, XIcon } from 'lucide-react-native';
import React, { useRef } from 'react';
import { TextInput } from 'react-native';
import { createNearestUsersQueryOptions } from '../lib/queryOptions';
import { CreateConvoSearchParams } from '../lib/types';
import UserProfileItem from './UserProfileItem';

export default function CreateDirectChat() {
  const coordinates = useCurrentCoordinates();
  const { data: nearestUsers, ...usersQuery } = useQuery(
    createNearestUsersQueryOptions(coordinates)
  );
  const suggestions = nearestUsers?.map((user) => user.profile).filter((v) => !!v);

  const inputRef = useRef<TextInput>(null);

  const { searchTerm, setSearchTerm, clearSearch, willSearch, searchResults, ...query } =
    useUserSearch();

  const profiles = willSearch ? searchResults.map((s) => s.doc) : suggestions || [];

  const isLoading = query.isLoading || usersQuery.isLoading;

  function handleClearSearch() {
    clearSearch();
    inputRef.current?.clear();
  }

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
          <Input variant="underlined" className="my-2 grow bg-transparent">
            <InputField
              //@ts-expect-error Gluestack ref type mismatch
              ref={inputRef}
              placeholder="Type a name..."
              defaultValue={searchTerm}
              onChangeText={setSearchTerm}
              keyboardType="web-search"
              autoCorrect={false}
              autoCapitalize="words"
              autoComplete="name"
            />
            {searchTerm && (
              <InputSlot>
                <Pressable
                  className="overflow-hidden rounded-full p-2"
                  onPress={handleClearSearch}
                  hitSlop={8}
                >
                  <Icon as={XIcon} />
                </Pressable>
              </InputSlot>
            )}
          </Input>
        </HStack>
      </Box>

      <FlashList
        data={profiles}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponentStyle={{ marginBottom: 4 }}
        onEndReached={query.fetchNextPage}
        ListHeaderComponent={
          willSearch
            ? () => isLoading && <Spinner size={'large'} style={{ marginTop: 16 }} />
            : () => <ListHeader isLoading={usersQuery.isLoading} />
        }
        ListFooterComponent={() =>
          query.isFetchingNextPage && <Spinner size={'small'} className="my-2" />
        }
        ListEmptyComponent={() =>
          !isLoading && (
            <NoData
              title="No results found"
              className="self-center"
              style={{ marginTop: 64, width: '80%' }}
            />
          )
        }
        renderItem={({ item }) => {
          const slug = item.relationTo;
          const id = extractID(item.value);
          return (
            <Link href={'/'} asChild>
              <Pressable className="px-5 py-4">
                <UserProfileItem profile={item} />
              </Pressable>
            </Link>
          );
        }}
      />
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
