import { AnimatedPressable } from '@/components/animated/pressable';
import { Box } from '@/components/ui/box';
import { InfiniteFlashList, ListRenderItem } from '@/components/ui/list';
import { useMeUser } from '@/hooks/auth/useAuth';
import { SceneProps } from '@/lib/types/tab-types';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { Donation } from '@lactalink/types/payload-generated-types';
import { displayVolume } from '@lactalink/utilities';
import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { Link } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { useInfiniteUserDonations } from '../../hooks/queries/useInfiniteUserDonations';
import DonationCard from '../cards/DonationCard';
import ListingOwnerActionsheet, { ListingOwnerActionsheetRef } from '../ListingOwnerActionsheet';

export default function AccountDonationList({ route }: SceneProps) {
  const status = route.key as Donation['status'];

  const { data: meUser } = useMeUser();
  const { data: donations, isPlaceholderData, ...query } = useInfiniteUserDonations(meUser, status);

  const sheetRef = useRef<ListingOwnerActionsheetRef>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isSheetOpenRef = useRef(false);

  const handleSheetOpenChange = useCallback((open: boolean) => {
    isSheetOpenRef.current = open;
    setIsSheetOpen(open);
  }, []);

  const renderItem = useCallback<ListRenderItem<Donation>>(
    ({ item }) => {
      if (isPlaceholderData) return <DonationCard.Skeleton />;
      const { status, volume } = item;
      const statuslabel = DONATION_REQUEST_STATUS[status].label.toLowerCase();
      const ariaLabel = `${displayVolume(volume)} ${statuslabel} donation.`;
      return (
        <Link asChild href={`/donations/${item.id}`}>
          <AnimatedPressable
            className="overflow-hidden rounded-2xl"
            aria-label={ariaLabel}
            delayLongPress={500}
            recyclingKey={'donation-' + item.id}
            onLongPress={(e) => {
              sheetRef.current?.open(item);
              e.stopPropagation();
            }}
          >
            <DonationCard data={item} />
          </AnimatedPressable>
        </Link>
      );
    },
    [isPlaceholderData]
  );

  return (
    <>
      <Box
        className="flex-1"
        onStartShouldSetResponderCapture={() => isSheetOpenRef.current}
        onMoveShouldSetResponderCapture={() => isSheetOpenRef.current}
      >
        <InfiniteFlashList
          {...query}
          data={donations}
          keyExtractor={listKeyExtractor}
          renderItem={renderItem}
          emptyListLabel={`No donations found`}
          refreshing={query.isRefetching}
          onRefresh={query.refetch}
          contentContainerClassName="p-4"
          scrollEnabled={!isSheetOpen}
          ItemSeparatorComponent={() => <Box className="h-4" />}
        />
      </Box>

      <ListingOwnerActionsheet
        ref={sheetRef}
        isOpen={isSheetOpen}
        onOpenChange={handleSheetOpenChange}
      />
    </>
  );
}
