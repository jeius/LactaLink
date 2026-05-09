import Avatar from '@/components/Avatar';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { InfiniteFlashList } from '@/components/ui/list';
import { Pressable, PressableProps } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack, VStackProps } from '@/components/ui/vstack';
import { useProfileData } from '@/features/profile/hooks/useProfileData';
import { useUserSearch } from '@/features/user-search/hooks/useUserSearch';
import { UserSearch } from '@lactalink/types/payload-generated-types';
import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { SearchIcon, XIcon } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { GestureResponderEvent, TextInput } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { createDataMarkerFromOrg } from '../lib/utils/markerUtils';
import { useMarkerActions } from './contexts/markers';

const AnimatedBox = Animated.createAnimatedComponent(Card);

export default function MapSearchInput(props: VStackProps) {
  const inputRef = useRef<TextInput>(null);
  const { searchResults, searchTerm, setSearchTerm, clearSearch, willSearch, ...searchQuery } =
    useUserSearch({ profileTypes: ['hospitals', 'milkBanks'] });

  const { isFetching, isRefetching, refetch } = searchQuery;
  const [inputValue, setInputValue] = useState(searchTerm);
  const [inputFocused, setInputFocused] = useState(false);

  function handleClearSearch() {
    clearSearch();
    setInputValue('');
  }

  return (
    <VStack {...props} space="md">
      <Input variant="rounded">
        <InputSlot className="ml-2">
          <InputIcon as={SearchIcon} />
        </InputSlot>

        <InputField
          ref={inputRef}
          className="px-2"
          value={inputValue}
          placeholder="Search for hospitals or milk banks"
          onChangeText={(text) => {
            setInputValue(text);
            setSearchTerm(text);
          }}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          keyboardType="web-search"
          autoComplete="name"
          autoCorrect={false}
        />

        {isFetching && (
          <InputSlot className="mr-2">
            <Spinner size={'small'} />
          </InputSlot>
        )}

        {inputValue.length > 0 && (
          <InputSlot className="mr-2">
            <Button
              variant="ghost"
              action="default"
              className="h-fit w-fit rounded-full p-2"
              onPress={handleClearSearch}
            >
              <ButtonIcon as={XIcon} />
            </Button>
          </InputSlot>
        )}
      </Input>

      {willSearch && inputFocused && searchResults.length > 0 && (
        <AnimatedBox entering={FadeInUp} exiting={FadeOutUp} className="h-64 w-full p-0">
          <InfiniteFlashList
            {...searchQuery}
            data={searchResults}
            contentContainerClassName="grow"
            refreshing={isRefetching}
            onRefresh={refetch}
            keyExtractor={listKeyExtractor}
            renderItem={({ item }) => {
              return (
                <RenderItem
                  item={item}
                  className="flex-row items-center gap-3 p-4"
                  onPress={() => inputRef.current?.blur()}
                />
              );
            }}
          />
        </AnimatedBox>
      )}
    </VStack>
  );
}

type RenderItemProps = PressableProps & {
  item: UserSearch;
};

function RenderItem({ item, ...props }: RenderItemProps) {
  const { data, isLoading } = useProfileData(item.doc);

  const { addMarker, setSelectedMarker } = useMarkerActions();

  function handlePress(e: GestureResponderEvent) {
    props.onPress?.(e);
    if (!data || data.relationTo === 'individuals') return;
    const dataMarker = createDataMarkerFromOrg(data);
    addMarker(dataMarker);
    setTimeout(() => {
      setSelectedMarker(dataMarker.marker.id);
    }, 200);
  }

  return (
    <Pressable {...props} disabled={isLoading} onPress={handlePress}>
      <Avatar profile={item.doc} className="h-10 w-10" />
      <Text className="flex-1 font-JakartaSemiBold" numberOfLines={1}>
        {item.title || 'Unknown Organization'}
      </Text>
    </Pressable>
  );
}
