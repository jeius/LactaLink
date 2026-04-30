import { Hospital, MilkBank } from '@lactalink/types/payload-generated-types';

import { AnimatedPressable } from '@/components/animated/pressable';
import {
  useHideOnScrollAnimation,
  useScrollAnimationMethods,
} from '@/components/contexts/ScrollProvider';
import { NoData } from '@/components/NoData';
import { Box } from '@/components/ui/box';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { InfiniteFlashList } from '@/components/ui/list';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { addToProfileCache } from '@/features/profile/lib/cacheUtils';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { formatCamelCase } from '@lactalink/utilities/formatters';
import { useRouter } from 'expo-router';
import { debounce } from 'lodash';
import { XIcon } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import Animated from 'react-native-reanimated';
import { useInfiniteNearestOrganizations } from '../hooks/queries';
import OrganizationListCard from './OrganizationListCard';

interface OrganizationListProps {
  collection: Extract<CollectionSlug, 'hospitals' | 'milkBanks'>;
}

export function OrganizationList({ collection }: OrganizationListProps) {
  const { scrollValue, scrollDirection: _, ...scrollHandlers } = useScrollAnimationMethods();
  const headerAnimatedStyle = useHideOnScrollAnimation(scrollValue, {
    animationDirection: 'up',
    animateDistance: 60,
  });

  const [inputVal, setInputVal] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSetSearch = useMemo(() => debounce(setSearch, 200, { trailing: true }), []);

  const {
    data: organizations,
    isRefetching,
    refetch,
    ...query
  } = useInfiniteNearestOrganizations(collection, {
    search,
    callback: (doc, queryClient) => {
      addToProfileCache(queryClient, { relationTo: collection, value: doc });
    },
  });

  return (
    <Box className="flex-1">
      <InfiniteFlashList
        {...query}
        {...scrollHandlers}
        data={organizations}
        keyExtractor={listKeyExtractor}
        headerClassName="mb-3"
        contentContainerClassName="p-4"
        contentContainerStyle={{ paddingTop: 60 + 16 }}
        refreshing={isRefetching}
        onRefresh={refetch}
        ItemSeparatorComponent={() => <Box className="h-4" />}
        ListEmptyComponent={<NoData title={`No ${formatCamelCase(collection)} found`} />}
        renderItem={({ item }) => {
          if (isPlaceHolderData(item)) return <Skeleton className="h-24" />;
          return <RenderItem item={item} relationTo={collection} />;
        }}
      />

      <Animated.View
        style={[headerAnimatedStyle]}
        className="absolute inset-x-0 top-0 border-b border-outline-200 bg-background-0 px-4 py-3"
      >
        <Input variant="rounded" size="md">
          <InputField
            value={inputVal}
            onChangeText={(text) => {
              setInputVal(text);
              debouncedSetSearch(text.trim());
            }}
            placeholder={`Search ${formatCamelCase(collection)}...`}
          />
          {inputVal &&
            (query.isFetching ? (
              <Spinner size={'small'} className="mr-3" />
            ) : (
              <InputSlot
                className="mr-3"
                onPress={() => {
                  setInputVal('');
                  debouncedSetSearch('');
                }}
              >
                <InputIcon as={XIcon} />
              </InputSlot>
            ))}
        </Input>
      </Animated.View>
    </Box>
  );
}

function RenderItem({
  item,
  relationTo,
}: {
  item: Hospital | MilkBank;
  relationTo: Extract<CollectionSlug, 'hospitals' | 'milkBanks'>;
}) {
  const router = useRouter();
  const badgeLabel =
    relationTo === 'hospitals' ? 'Hospital' : relationTo === 'milkBanks' ? 'Milk Bank' : undefined;

  function handlePress() {
    router.push(`/profile/${relationTo}/${item.id}`);
  }
  return (
    <AnimatedPressable onPress={handlePress} className="overflow-hidden rounded-xl">
      <OrganizationListCard
        data={item}
        badgeLabel={badgeLabel}
        canViewThumbnail
        size="sm"
        className="rounded-xl"
      />
    </AnimatedPressable>
  );
}
