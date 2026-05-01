import { AnimatedPressable } from '@/components/animated/pressable';
import { LocateButton } from '@/components/buttons/LocateButton';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { HandBottle2Icon, MilkBottlePlus2Icon } from '@/components/ui/icon/custom';
import ScrollView from '@/components/ui/ScrollView';
import { Text } from '@/components/ui/text';
import { createDirectionalShadow } from '@/lib/utils/shadows';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Donation, Hospital, MilkBank, Request } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { formatCamelCaseCaps } from '@lactalink/utilities/formatters';
import { isDonation, isRequest } from '@lactalink/utilities/type-guards';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Building2Icon, HospitalIcon, LucideIcon } from 'lucide-react-native';
import { FC, useEffect, useMemo, useState } from 'react';
import { SvgProps } from 'react-native-svg';
import { MapListingSlug, MapMarker, MapQueryParams } from '../lib/types';
import { mapMarkerToRNMarker } from '../lib/utils/markerUtils';
import { useMarkerActions, useMarkersMap, useSelectedMarker } from './contexts/markers';
import DetailsSheet from './DetailsSheet';
import ListingsSheet from './ListingsSheet';
import OrganizationsSheet from './OrganizationsSheet';

type DataType = {
  relationTo: MapListingSlug;
  value: Donation | Request | Hospital | MilkBank;
};

const LIST_SLUGS: MapListingSlug[] = ['donations', 'requests', 'hospitals', 'milkBanks'];
const ICONS: Record<MapListingSlug, LucideIcon | FC<SvgProps>> = {
  donations: HandBottle2Icon,
  requests: MilkBottlePlus2Icon,
  hospitals: HospitalIcon,
  milkBanks: Building2Icon,
};

const pressableStyle = tva({
  base: 'flex-row items-center gap-2 overflow-hidden rounded-full px-3 py-2',
  variants: {
    selected: {
      true: 'bg-typography-900',
      false: 'bg-background-100',
    },
  },
});

const pressableTextStyle = tva({
  base: 'font-JakartaSemiBold',
  variants: {
    selected: {
      true: 'text-typography-0',
      false: 'text-typography-900',
    },
  },
});

export default function MapListings() {
  const { list } = useLocalSearchParams<MapQueryParams>();
  const router = useRouter();

  const { setSelectedMarker, addMarker } = useMarkerActions();
  const markersMap = useMarkersMap();
  const [selectedMarker] = useSelectedMarker();

  const [type, setType] = useState<MapListingSlug | null>(null);
  const [selectedData, setSelectedData] = useState<DataType | null>(null);

  const deliveryPreferences = useMemo(() => {
    if (!selectedData) return null;
    const doc = selectedData.value;
    if (!isDonation(doc) || isRequest(doc)) return null;
    return extractCollection(doc.deliveryPreferences);
  }, [selectedData]);

  function setListParams(slug: MapListingSlug | undefined) {
    router.setParams({ list: slug } as MapQueryParams);
  }

  function closeListings() {
    setListParams(undefined);
  }

  function handleSelect(data: Donation | Request | Hospital | MilkBank) {
    if (!type) return;
    setSelectedData({ relationTo: type, value: data });
  }

  function handleDetailsClose() {
    setSelectedData(null);
    setSelectedMarker(null);
  }

  function handleLocate(mapMarker: MapMarker) {
    const marker = mapMarkerToRNMarker(mapMarker);
    if (markersMap.has(marker.id)) {
      setSelectedMarker(marker.id);
      return;
    } else {
      addMarker({ data: mapMarker, marker });
      setSelectedMarker(marker.id);
    }
    setSelectedData(null);
  }

  useEffect(() => {
    const listings: MapListingSlug[] = ['donations', 'requests', 'hospitals', 'milkBanks'];
    if (list && listings.includes(list)) {
      setType(list);
    } else {
      setType(null);
    }
  }, [list]);

  return (
    <Box pointerEvents="box-none">
      <LocateButton className="mx-4 mb-4 self-end" />

      {!selectedMarker &&
        !selectedData &&
        type &&
        (type === 'donations' || type === 'requests' ? (
          <ListingsSheet type={type} onClose={closeListings} onSelect={handleSelect} />
        ) : (
          <OrganizationsSheet type={type} onClose={closeListings} onSelect={handleSelect} />
        ))}

      {!selectedMarker && selectedData && (
        <DetailsSheet
          initialDetentIndex={1}
          data={selectedData}
          deliveryPreference={deliveryPreferences}
          onWillDismiss={handleDetailsClose}
          onLocate={handleLocate}
        />
      )}

      <ScrollView
        horizontal
        overScrollMode="never"
        className="bg-background-0"
        contentContainerClassName="items-center px-4 py-2 gap-2 justify-center grow"
        style={createDirectionalShadow('top', 'lg')}
      >
        {LIST_SLUGS.map((slug, i) => {
          const label = formatCamelCaseCaps(slug);
          const selected = slug === list;
          return (
            <AnimatedPressable
              key={i}
              onPress={() => setListParams(selected ? undefined : slug)}
              aria-selected={selected}
              className={pressableStyle({ selected })}
            >
              <Icon as={ICONS[slug]} className={pressableTextStyle({ selected })} />
              <Text className={pressableTextStyle({ selected })}>{label}</Text>
            </AnimatedPressable>
          );
        })}
      </ScrollView>
    </Box>
  );
}
