import { ProfileAvatar } from '@/components/Avatar';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { NoData } from '@/components/NoData';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useUserSearch } from '@/features/user-search/hooks/useUserSearch';
import { getColor } from '@/lib/colors';
import { useCurrentCoordinates } from '@/lib/stores';
import { shadow } from '@/lib/utils/shadows';
import { User } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractName } from '@lactalink/utilities/extractors';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import isEqual from 'lodash/isEqual';
import { CheckCircle2Icon, CircleIcon, SearchIcon, XIcon } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { toast } from 'sonner-native';
import { useCreateGroupChat } from '../hooks/mutations';
import { createNearestUsersQueryOptions } from '../lib/queryOptions';
import UserProfileItem from './UserProfileItem';

interface ListHeaderProps {
  isLoading?: boolean;
  selectedUsers?: NonNullable<User['profile']>[];
  setSelectedUsers?: (users: NonNullable<User['profile']>[]) => void;
}

interface SearchInputProps {
  value: string;
  onChange: (text: string) => void;
  onClear?: () => void;
}

interface GroupNameInputProps {
  value: string;
  onChange: (text: string) => void;
}

export default function CreateGroupChat() {
  const router = useRouter();

  const coordinates = useCurrentCoordinates();
  const { data: nearestUsers, ...usersQuery } = useQuery(
    createNearestUsersQueryOptions(coordinates)
  );
  const suggestions = nearestUsers?.map((user) => user.profile).filter((v) => !!v);

  const { searchTerm, setSearchTerm, clearSearch, willSearch, searchResults, ...query } =
    useUserSearch();
  const profiles = willSearch ? searchResults.map((s) => s.doc) : suggestions || [];
  const isLoading = query.isLoading || usersQuery.isLoading;

  const { mutateAsync: createGroupChat, isPending: isCreating } = useCreateGroupChat();

  const [selectedUsers, setSelectedUsers] = useState<typeof suggestions>([]);
  const [groupName, setGroupName] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!selectedUsers || selectedUsers.length === 0) return;

    const promise = createGroupChat({ participants: selectedUsers, name: groupName });
    toast.promise(promise, {
      loading: 'Creating group chat...',
      success: () => 'Group chat created!',
      error: (err) => extractErrorMessage(err),
    });

    const conversation = await promise;
    router.dismissTo(`/chat/${conversation.id}`);
  }, [selectedUsers, createGroupChat, groupName, router]);

  const renderItem = useCallback<ListRenderItem<(typeof profiles)[number]>>(
    ({ item, extraData: { selectedUsers } }) => {
      const isSelected = selectedUsers?.some((u: typeof item) => isEqual(u, item));

      function handleSelect() {
        if (isSelected) return;
        setSelectedUsers((prev) => (prev ? [...prev, item] : [item]));
      }

      return (
        <Pressable className="px-5 py-4" onPress={handleSelect}>
          <UserProfileItem profile={item} />
          <Box pointerEvents="none" className="absolute inset-0 items-end justify-center p-4">
            <Icon
              as={isSelected ? CheckCircle2Icon : CircleIcon}
              className={isSelected ? 'fill-primary-100 text-primary-500' : 'text-outline-800'}
            />
          </Box>
        </Pressable>
      );
    },
    []
  );

  return (
    <SafeArea className="items-stretch">
      <Box
        className="gap-4 border-outline-200 bg-background-50 pb-4"
        style={[shadow.sm, { borderBottomWidth: 1 }]}
      >
        <HStack space="xs" className="items-center gap-4 px-2 pt-2">
          <HeaderBackButton tintColor={getColor('typography', '900')} />

          <Text bold size="lg" className="flex-1">
            New Group
          </Text>

          <Button
            size="sm"
            className="mr-2"
            isDisabled={!selectedUsers || selectedUsers.length < 3 || isCreating}
            onPress={handleSubmit}
          >
            <ButtonText>Create</ButtonText>
          </Button>
        </HStack>

        <GroupNameInput value={groupName} onChange={setGroupName} />

        <SearchInput value={searchTerm} onChange={setSearchTerm} onClear={clearSearch} />
      </Box>

      <FlashList
        data={profiles}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponentStyle={{ marginBottom: 4 }}
        onEndReached={query.fetchNextPage}
        extraData={{ selectedUsers }}
        renderItem={renderItem}
        ListHeaderComponent={
          willSearch
            ? () => isLoading && <Spinner size={'large'} style={{ marginTop: 16 }} />
            : () => (
                <ListHeader
                  isLoading={usersQuery.isLoading}
                  selectedUsers={selectedUsers}
                  setSelectedUsers={setSelectedUsers}
                />
              )
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
      />
    </SafeArea>
  );
}

function ListHeader({ isLoading, selectedUsers, setSelectedUsers }: ListHeaderProps) {
  return (
    <>
      {selectedUsers && selectedUsers.length > 0 && (
        <FlashList
          horizontal
          data={selectedUsers}
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="p-4"
          ItemSeparatorComponent={() => <Box className="w-4" />}
          renderItem={({ item, index }) => {
            function handleRemove() {
              if (!selectedUsers) return;
              setSelectedUsers?.(selectedUsers.filter((_, idx) => idx !== index));
            }

            return (
              <VStack className="items-center">
                <ProfileAvatar profile={item} size="lg" />
                <Text size="sm" numberOfLines={1}>
                  {extractName({ profile: item })}
                </Text>
                <Pressable
                  onPress={handleRemove}
                  className="absolute right-0 top-0 overflow-hidden rounded-full bg-error-500 p-1"
                  hitSlop={8}
                >
                  <Icon as={XIcon} color="white" size="xs" />
                </Pressable>
              </VStack>
            );
          }}
        />
      )}
      <Text size="sm" className="mx-5 mt-2 font-JakartaMedium text-typography-700">
        Suggested
      </Text>
      {isLoading && <Spinner size={'large'} style={{ marginTop: 32 }} />}
    </>
  );
}

function SearchInput({ value, onChange, onClear }: SearchInputProps) {
  const inputRef = useRef<TextInput>(null);

  function handleClearSearch() {
    onClear?.();
    inputRef.current?.clear();
  }

  return (
    <Input variant="rounded" className="mx-4">
      <InputIcon as={SearchIcon} className="ml-3" />

      <InputField
        //@ts-expect-error Gluestack ref type mismatch
        ref={inputRef}
        placeholder="Search a user..."
        defaultValue={value}
        onChangeText={onChange}
        keyboardType="web-search"
        autoCorrect={false}
        autoCapitalize="words"
        autoComplete="name"
        className="grow"
      />

      {value && (
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
  );
}

function GroupNameInput({ value, onChange }: GroupNameInputProps) {
  return (
    <Input variant="underlined" className="mx-5 bg-transparent">
      <InputField
        placeholder="Group Name (optional)"
        value={value}
        onChangeText={onChange}
        autoCorrect={false}
        autoCapitalize="words"
        autoComplete="off"
      />
    </Input>
  );
}
