import { AnimatedPressable } from '@/components/animated/pressable';
import { Box } from '@/components/ui/box';
import { InfiniteFlashList } from '@/components/ui/list';
import Sheet from '@/components/ui/sheet';
import OrganizationListCard from '@/features/organizations/components/OrganizationListCard';
import { useInfiniteNearestOrganizations } from '@/features/organizations/hooks/queries';
import { Hospital, MilkBank } from '@lactalink/types/payload-generated-types';
import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { formatCamelCase, formatCamelCaseAllCaps } from '@lactalink/utilities/formatters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DataMarkerSlug } from '../lib/types';
import { addToDataMarkerCache } from '../lib/utils/cacheUtils';

interface OrganizationsSheetProps {
  type: Extract<DataMarkerSlug, 'hospitals' | 'milkBanks'>;
  onClose?: () => void;
  onSelect?: (data: Hospital | MilkBank) => void;
}

export default function OrganizationsSheet({ type, onClose, onSelect }: OrganizationsSheetProps) {
  const insets = useSafeAreaInsets();

  const { data: orgs, ...query } = useInfiniteNearestOrganizations(type, {
    callback: (doc, client) => {
      addToDataMarkerCache(client, { value: doc, relationTo: type });
    },
  });

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
        data={orgs}
        keyExtractor={listKeyExtractor}
        nestedScrollEnabled
        gap={8}
        emptyListLabel={`No ${formatCamelCase(type)} found nearby.`}
        contentContainerClassName="p-4"
        renderItem={({ item, isPlaceholder }) => {
          if (isPlaceholder) return <OrganizationListCard.Skeleton />;
          return (
            <AnimatedPressable
              className="overflow-hidden rounded-2xl"
              onPress={() => onSelect?.(item)}
            >
              <OrganizationListCard data={item} badgeLabel={formatCamelCaseAllCaps(type)} />
            </AnimatedPressable>
          );
        }}
      />
    </Sheet>
  );
}
