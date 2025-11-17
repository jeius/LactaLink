import { DonationListCard, RequestListCard } from '@/components/cards';
import { useForm } from '@/components/contexts/FormProvider';
import { NoData } from '@/components/NoData';
import { Badge, BadgeText } from '@/components/ui/badge';
import {
  BottomSheet,
  BottomSheetBackdrop,
  BottomSheetDragIndicator,
  BottomSheetFlashList,
  BottomSheetModalPortal,
} from '@/components/ui/bottom-sheet';
import { Pressable } from '@/components/ui/pressable';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { getDonationRequestStatusColor } from '@/lib/colors/getColor';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { type PostSchema } from '@lactalink/form-schemas';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { extractID, listKeyExtractor } from '@lactalink/utilities/extractors';
import { formatKebabToTitle } from '@lactalink/utilities/formatters';
import { isDonation } from '@lactalink/utilities/type-guards';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PLACEHOLDER_ITEMS = generatePlaceHoldersWithID(10, {} as Donation | Request);

export default function AttachmentSheet({
  collection,
  isOpen,
  setOpen,
}: {
  collection?: 'donations' | 'requests';
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { data: meUser } = useMeUser();
  const insets = useSafeAreaInsets();

  const { setValue } = useForm<PostSchema>();

  const { data, isLoading } = useFetchBySlug(!!collection, {
    collection: collection!,
    where: { createdBy: { equals: extractID(meUser) } },
  });

  const handleSelect = (item: Donation | Request) => {
    setValue(
      'sharedFrom',
      { relationTo: collection!, value: item.id },
      { shouldDirty: true, shouldTouch: true }
    );
    setOpen(false);
  };

  const ListHeader = () => (
    <Text size="xl" bold>
      Your {formatKebabToTitle(collection!)}
    </Text>
  );

  return (
    <BottomSheet open={isOpen} setOpen={setOpen}>
      <BottomSheetModalPortal
        snapPoints={['50%', '100%']}
        enableDynamicSizing={false}
        enableContentPanningGesture
        backdropComponent={BottomSheetBackdrop}
        handleComponent={BottomSheetDragIndicator}
        topInset={insets.top}
      >
        <BottomSheetFlashList
          data={isLoading ? PLACEHOLDER_ITEMS : (data ?? [])}
          keyExtractor={listKeyExtractor}
          style={{ paddingBottom: insets.bottom }}
          ListEmptyComponent={() => (
            <NoData className="mt-4 w-64 self-center" title={`You have no ${collection}.`} />
          )}
          ListHeaderComponent={ListHeader}
          ListHeaderComponentStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
          contentContainerClassName="flex-col items-stretch"
          renderItem={({ item }) => {
            if (isPlaceHolderData(item)) return <Skeleton className="m-4 my-2 h-24 w-auto" />;

            const status = DONATION_REQUEST_STATUS[item.status];

            const StatusBadge = () => (
              <VStack space="xs" className="items-center">
                <Badge
                  size="sm"
                  style={{ backgroundColor: getDonationRequestStatusColor(status.value, '50') }}
                >
                  <BadgeText style={{ color: getDonationRequestStatusColor(status.value, '700') }}>
                    {status.label}
                  </BadgeText>
                </Badge>
              </VStack>
            );

            return (
              <Pressable onPress={() => handleSelect(item)}>
                {isDonation(item) ? (
                  <DonationListCard
                    data={item}
                    hideFooter
                    className="border-0 bg-transparent"
                    variant="filled"
                    action={<StatusBadge />}
                    disableLinks
                  />
                ) : (
                  <RequestListCard
                    data={item}
                    hideFooter
                    className="border-0 bg-transparent"
                    variant="filled"
                    action={<StatusBadge />}
                    disableLinks
                  />
                )}
              </Pressable>
            );
          }}
        />
      </BottomSheetModalPortal>
    </BottomSheet>
  );
}
