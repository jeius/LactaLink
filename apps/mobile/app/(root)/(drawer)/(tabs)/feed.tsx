import React, { FC } from 'react';

import {
  useHeaderProgress,
  useHeaderScrollHandler,
  useHeaderSize,
} from '@/components/contexts/HeaderProvider';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Input, InputField, InputIcon } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useMeUser } from '@/hooks/auth/useAuth';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { Link, useRouter } from 'expo-router';
import { SearchIcon } from 'lucide-react-native';
import Animated, { AnimatedProps } from 'react-native-reanimated';

const PLACEHOLDER = generatePlaceHoldersWithID(50, {});

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as FC<
  AnimatedProps<FlashListProps<any>>
>;

export default function FeedPage() {
  const router = useRouter();

  const { data } = useMeUser();

  const headerProgress = useHeaderProgress();
  const scrollHandler = useHeaderScrollHandler();

  const { height: headerHeight } = useHeaderSize();

  return (
    <SafeArea safeTop={false} mode="margin" className="items-stretch">
      <AnimatedFlashList
        data={PLACEHOLDER}
        keyExtractor={(item, idx) => `feed-${item.id}-${idx}`}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        contentContainerClassName="flex-col items-stretch grow"
        ListHeaderComponent={() => <SearchInput />}
        ListHeaderComponentStyle={{ padding: 16, marginTop: headerHeight }}
        ItemSeparatorComponent={() => <Box className="h-2" />}
        renderItem={({ item }) => <Skeleton variant="sharp" className="h-64" />}
      />
    </SafeArea>
  );
}

function SearchInput() {
  return (
    <Link asChild push href={'/search'}>
      <Input size="md" variant="rounded" className="flex-1">
        <InputIcon as={SearchIcon} className="ml-3 text-primary-500" />
        <InputField
          placeholder="Search donors, hospitals, milk banks..."
          editable={false}
          pointerEvents="none"
        />
      </Input>
    </Link>
  );
}
