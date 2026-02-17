import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack, HStackProps } from '@/components/ui/hstack';
import { HandBottleIcon } from '@/components/ui/icon/custom';
import { InfiniteFlashList } from '@/components/ui/list';
import Sheet, { SheetProps } from '@/components/ui/sheet';
import { SheetRef } from '@/components/ui/sheet/Sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useRequest } from '@/features/donation&request/hooks/queries';
import { useMeUser } from '@/hooks/auth/useAuth';
import { getColor } from '@/lib/colors/getColor';
import { DonationCreateParams } from '@/lib/types/donationRequest';
import { DeliveryPreference, Request } from '@lactalink/types/payload-generated-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isEqualProfiles, isPlaceHolderData } from '@lactalink/utilities/checkers';
import { extractCollection } from '@lactalink/utilities/extractors';
import { useRouter } from 'expo-router';
import { ClipboardListIcon, EditIcon } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DetailsDPListItem from '../DetailsDPListItem';
import { Details, DetailsSkeleton } from './Details';

const DETENTS = [0.5, 1];

interface ListingDetailsSheetProps extends Omit<SheetProps, 'detents' | 'dimmed'> {
  requestID: string | undefined;
  open: boolean;
}

function RequestDetailsSheet({ requestID, open, ...props }: ListingDetailsSheetProps) {
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
  const [footerHeight, setFooterHeight] = useState(0);

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
    <Sheet
      {...props}
      ref={sheetRef}
      detents={DETENTS}
      scrollable
      dimmed={false}
      backgroundColor={getColor('background', '50')}
      headerStyle={{ backgroundColor: getColor('background', '0') }}
      footerStyle={{ backgroundColor: getColor('background', '50') }}
      footer={
        data && (
          <SheetFooter
            data={data}
            onLayout={({ nativeEvent }) => setFooterHeight(nativeEvent.layout.height)}
            className="mx-4 my-2"
          />
        )
      }
    >
      <InfiniteFlashList
        data={deliveryPreferences}
        gap={12}
        nestedScrollEnabled
        isPlaceholderData={query.isPlaceholderData}
        ListHeaderComponent={<ListHeader data={data} />}
        ListFooterComponentStyle={{ height: footerHeight }}
        contentInsetAdjustmentBehavior="automatic"
        ListEmptyComponent={
          data && !isLoading ? (
            <Text size="sm" className="text-typography-800">
              No delivery preferences found.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Box className="mx-4">
            {isPlaceHolderData(item) ? (
              <Skeleton className="h-24 w-full rounded-lg" />
            ) : (
              <DetailsDPListItem item={item} />
            )}
          </Box>
        )}
      />
    </Sheet>
  );
}

function ListHeader({ data }: { data: Request | undefined | null }) {
  if (!data) return <DetailsSkeleton />;
  return (
    <VStack space="lg" className="pb-2">
      <Details data={data} />
      <Text size="lg" bold className="mx-4 font-JakartaSemiBold">
        Delivery Preferences
      </Text>
    </VStack>
  );
}

function SheetFooter({ data, space = 'sm', ...props }: { data: Request } & HStackProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: meUser } = useMeUser();

  const donor = { value: data.requester, relationTo: 'individuals' } as const;
  const isOwner = isEqualProfiles(meUser?.profile, donor);

  const mainBtnIcon = isOwner ? EditIcon : HandBottleIcon;
  const mainBtnLabel = isOwner ? 'Edit Request' : 'Donate';

  function handleMainBtnPress() {
    if (isOwner) {
      router.push(`/requests/${data.id}/edit`);
    } else {
      const params: DonationCreateParams = { mrid: data.id };
      router.push({ pathname: '/donations/create', params });
    }
  }

  function handleViewDetailsPress() {
    router.push(`/requests/${data.id}`);
  }

  return (
    <HStack {...props} space={space} style={[{ marginBottom: insets.bottom }, props.style]}>
      <Button
        size="lg"
        action={isOwner ? 'default' : 'tertiary'}
        className="flex-1 rounded-full shadow"
        onPress={handleMainBtnPress}
      >
        <ButtonIcon as={mainBtnIcon} className="h-6 w-6" />
        <ButtonText>{mainBtnLabel}</ButtonText>
      </Button>

      <Button
        size="lg"
        action="muted"
        className="rounded-full bg-background-0 shadow"
        onPress={handleViewDetailsPress}
      >
        <ButtonIcon as={ClipboardListIcon} className="h-6 w-6" />
        <ButtonText>Details</ButtonText>
      </Button>
    </HStack>
  );
}

export default RequestDetailsSheet;
