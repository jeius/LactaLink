import { DonationListCard, RequestListCard } from '@/components/cards';
import { useForm } from '@/components/contexts/FormProvider';
import { NoData } from '@/components/NoData';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Pressable } from '@/components/ui/pressable';
import { ActionSheet } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useInfiniteMyListings } from '@/features/donation&request/hooks/queries/useInfiniteMyListings';
import { getDonationRequestStatusColor } from '@/lib/colors/getColor';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { type PostSchema } from '@lactalink/form-schemas';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { formatKebabToTitle } from '@lactalink/utilities/formatters';
import { isDonation } from '@lactalink/utilities/type-guards';

export default function AttachmentSheet({
  collection,
  isOpen,
  setOpen,
}: {
  collection: Extract<CollectionSlug, 'donations' | 'requests'> | undefined | null;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { setValue } = useForm<PostSchema>();

  const { data, ...query } = useInfiniteMyListings(collection);
  const isEmpty = data.length === 0;

  const handleSelect = (item: Donation | Request) => {
    if (!collection) return;
    const options = { shouldDirty: true, shouldTouch: true };
    setValue('sharedFrom', { relationTo: collection, value: item.id }, options);
    // Remove media when an attachment is selected
    setValue('media', undefined, options);
    setOpen(false);
  };

  return (
    <ActionSheet open={isOpen} setOpen={setOpen}>
      <ActionSheet.Content detents={isEmpty ? [0.5] : [0.5, 1]} scrollable>
        <ActionSheet.InfiniteList
          {...query}
          data={data}
          nestedScrollEnabled
          keyExtractor={listKeyExtractor}
          headerClassName="px-4 py-2"
          ListEmptyComponent={<NoData className="mt-4" title={`You have no ${collection}.`} />}
          ListHeaderComponent={
            <Text size="xl" bold>
              Your {collection ? formatKebabToTitle(collection) : 'Listings'}
            </Text>
          }
          renderItem={({ item, isPlaceholder }) => {
            if (isPlaceholder) return <Skeleton className="mx-2 mb-1 h-24 w-auto" />;
            return <RenderItem item={item} onSelect={handleSelect} />;
          }}
        />
      </ActionSheet.Content>
    </ActionSheet>
  );
}

function StatusBadge({ value, label }: { value: Donation['status']; label: string }) {
  return (
    <Box className="items-center">
      <Badge size="sm" style={{ backgroundColor: getDonationRequestStatusColor(value, '50') }}>
        <BadgeText style={{ color: getDonationRequestStatusColor(value, '700') }}>
          {label}
        </BadgeText>
      </Badge>
    </Box>
  );
}

function RenderItem({
  item,
  onSelect,
}: {
  item: Donation | Request;
  onSelect?: (item: Donation | Request) => void;
}) {
  const status = DONATION_REQUEST_STATUS[item.status];

  return (
    <Pressable onPress={() => onSelect?.(item)}>
      {isDonation(item) ? (
        <DonationListCard
          data={item}
          hideFooter
          className="border-0 bg-transparent"
          variant="filled"
          action={<StatusBadge {...status} />}
          disableLinks
        />
      ) : (
        <RequestListCard
          data={item}
          hideFooter
          className="border-0 bg-transparent"
          variant="filled"
          action={<StatusBadge {...status} />}
          disableLinks
        />
      )}
    </Pressable>
  );
}
