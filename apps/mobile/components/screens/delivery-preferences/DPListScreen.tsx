import { AnimatedPressable } from '@/components/animated/pressable';
import { NoData } from '@/components/NoData';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { FlashList, ListRenderItem } from '@/components/ui/FlashList';
import DPListCard from '@/features/delivery-preference/components/DPListCard';
import { useInfiniteDeliveryPreferences } from '@/features/delivery-preference/hooks/queries';
import { useMeUser } from '@/hooks/auth/useAuth';
import { createDirectionalShadow } from '@/lib/utils/shadows';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { EditIcon, PlusIcon } from 'lucide-react-native';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DPListScreen() {
  const insets = useSafeAreaInsets();

  const { userID } = useLocalSearchParams<{ userID?: string }>();
  const { data: meUser, ...meUserQuery } = useMeUser();

  const { data, isRefetching, isPlaceholderData, ...query } = useInfiniteDeliveryPreferences(
    userID ?? meUser
  );

  const headerTitle = 'Delivery Preferences';

  const renderItem = useCallback<ListRenderItem<DeliveryPreference>>(
    ({ item }) => {
      if (isPlaceholderData) return <DPListCard.Skeleton />;
      return (
        <Link asChild href={`/delivery-preferences/${item.id}`}>
          <AnimatedPressable className="overflow-hidden rounded-2xl">
            <DPListCard
              data={item}
              action={
                <Link asChild href={`/delivery-preferences/${item.id}/edit`}>
                  <Button action="default" variant="ghost" className="h-fit w-fit p-2">
                    <ButtonIcon as={EditIcon} />
                  </Button>
                </Link>
              }
            />
          </AnimatedPressable>
        </Link>
      );
    },
    [isPlaceholderData]
  );

  function handleRefresh() {
    query.refetch();
    meUserQuery.refetch();
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle }} />
      <FlashList
        data={data}
        keyExtractor={listKeyExtractor}
        renderItem={renderItem}
        refreshing={isRefetching}
        onRefresh={handleRefresh}
        contentContainerClassName="p-4 grow"
        ItemSeparatorComponent={() => <Box className="h-4" />}
        ListEmptyComponent={<NoData title="No delivery preferences found" />}
      />

      <Box
        className="rounded-t-2xl border border-outline-300 bg-background-0 p-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16), ...createDirectionalShadow('top') }}
      >
        <Link asChild href="/delivery-preferences/create">
          <Button>
            <ButtonIcon as={PlusIcon} />
            <ButtonText>New Delivery Preference</ButtonText>
          </Button>
        </Link>
      </Box>
    </>
  );
}
