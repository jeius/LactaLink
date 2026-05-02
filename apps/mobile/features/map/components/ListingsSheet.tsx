import { AnimatedPressable } from '@/components/animated/pressable';
import { Box } from '@/components/ui/box';
import { InfiniteFlashList } from '@/components/ui/list';
import Sheet from '@/components/ui/sheet';
import DonationCard from '@/features/donation&request/components/cards/DonationCard';
import RequestCard from '@/features/donation&request/components/cards/RequestCard';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { formatCamelCase } from '@lactalink/utilities/formatters';
import { isDonation } from '@lactalink/utilities/type-guards';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInfiniteNearestListings } from '../hooks/queries';
import { DataMarkerSlug } from '../lib/types';

interface ListingsSheetProps {
  type: Extract<DataMarkerSlug, 'donations' | 'requests'>;
  onClose?: () => void;
  onSelect?: (data: Donation | Request) => void;
}

export default function ListingsSheet({ type, onClose, onSelect }: ListingsSheetProps) {
  const insets = useSafeAreaInsets();

  const { data: listings, ...query } = useInfiniteNearestListings(type);

  return (
    <Sheet
      scrollable
      detents={[0.35, 0.7, 1]}
      initialDetentIndex={1}
      dimmed={false}
      onDidDismiss={onClose}
      backgroundColorClassName="bg-background-50"
      footerClassName="bg-background-50"
      footerStyle={{ paddingBottom: insets.bottom, width: '100%' }}
      footer={<Box />}
    >
      <InfiniteFlashList
        {...query}
        data={listings}
        keyExtractor={listKeyExtractor}
        nestedScrollEnabled
        gap={8}
        emptyListLabel={`No ${formatCamelCase(type)} found nearby.`}
        contentContainerClassName="p-4"
        renderItem={({ item, isPlaceholder }) => {
          if (isPlaceholder) {
            if (type === 'donations') return <DonationCard.Skeleton />;
            return <RequestCard.Skeleton />;
          }
          return (
            <AnimatedPressable
              className="overflow-hidden rounded-2xl"
              onPress={() => onSelect?.(item)}
            >
              {isDonation(item) ? <DonationCard data={item} /> : <RequestCard data={item} />}
            </AnimatedPressable>
          );
        }}
      />
    </Sheet>
  );
}
