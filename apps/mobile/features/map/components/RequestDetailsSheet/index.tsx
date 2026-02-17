import { InfiniteFlashList } from '@/components/ui/list';
import Sheet, { SheetProps } from '@/components/ui/sheet';
import { SheetRef } from '@/components/ui/sheet/Sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useRequest } from '@/features/donation&request/hooks/queries';
import { Address, DeliveryPreference, Request } from '@lactalink/types/payload-generated-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { extractCollection } from '@lactalink/utilities/extractors';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { MapQueryParams } from '../../lib/types';
import DetailsDPListItem from '../DetailsDPListItem';
import { Details, DetailsSkeleton } from './Details';

const DETENTS = [0.5, 1];

interface ListingDetailsSheetProps extends Omit<SheetProps, 'detents' | 'dimmed'> {
  requestID: string | undefined;
  open: boolean;
}

function DonationDetailsSheet({ requestID, open, ...props }: ListingDetailsSheetProps) {
  const router = useRouter();

  const { data, isLoading, ...query } = useRequest(requestID);

  const deliveryPreferences = useMemo(
    () =>
      isLoading || !data
        ? generatePlaceHoldersWithID(5, {} as DeliveryPreference)
        : extractCollection(data?.deliveryPreferences) || [],
    [data, isLoading]
  );

  const sheetRef = useRef<SheetRef>(null);
  const presentedRef = useRef(false);

  const handleOnLocate = useCallback(
    (address: Address) => {
      const point = address.coordinates;
      if (!point) return;
      const { latitude: lat, longitude: lng } = pointToLatLng(point);
      sheetRef.current?.dismiss();
      presentedRef.current = false;
      router.setParams({ lat: lat.toString(), lng: lng.toString() } as MapQueryParams);
    },
    [router]
  );

  useEffect(() => {
    if (open) {
      if (presentedRef.current) return;
      sheetRef.current?.present();
      presentedRef.current = true;
    } else {
      if (!presentedRef.current) return;
      sheetRef.current?.dismiss();
      presentedRef.current = false;
    }
  }, [open]);

  return (
    <Sheet {...props} ref={sheetRef} detents={DETENTS} scrollable dimmed={false}>
      <InfiniteFlashList
        data={deliveryPreferences}
        gap={12}
        nestedScrollEnabled
        contentContainerClassName="p-4"
        isPlaceholderData={query.isPlaceholderData}
        ListHeaderComponent={<ListHeader data={data} />}
        ListEmptyComponent={
          data && !isLoading ? (
            <Text size="sm" className="text-typography-800">
              No delivery preferences found.
            </Text>
          ) : null
        }
        renderItem={({ item, isPlaceholder }) =>
          isPlaceholder || isPlaceHolderData(item) ? (
            <Skeleton className="h-24 w-full rounded-lg" />
          ) : (
            <DetailsDPListItem item={item} onLocatePress={handleOnLocate} />
          )
        }
      />
    </Sheet>
  );
}

function ListHeader({ data }: { data: Request | undefined | null }) {
  if (!data) return <DetailsSkeleton />;
  return (
    <VStack space="lg" className="pb-2">
      <Details data={data} />
      <Text size="lg" bold className="font-JakartaSemiBold">
        Delivery Preferences
      </Text>
    </VStack>
  );
}

export default DonationDetailsSheet;
