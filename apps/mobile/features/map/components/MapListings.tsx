import { AnimatedPressable } from '@/components/animated/pressable';
import { LocateButton } from '@/components/buttons/LocateButton';
import { BasicCarousel } from '@/components/ui/BasicCarousel';
import { Box } from '@/components/ui/box';
import CollapsibleView from '@/components/ui/CollapsibleView';
import { Icon } from '@/components/ui/icon';
import { HandBottleIcon, MilkBottlePlus2Icon } from '@/components/ui/icon/custom';
import ScrollView from '@/components/ui/ScrollView';
import { Text } from '@/components/ui/text';
import { MapListingItem, MapListingSlug, MapQueryParams } from '@/features/map/lib/types';
import { useCurrentCoordinates } from '@/lib/stores';
import { createDirectionalShadow } from '@/lib/utils/shadows';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { formatCamelCaseCaps } from '@lactalink/utilities/formatters';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Building2Icon, HospitalIcon, LucideIcon } from 'lucide-react-native';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { SvgProps } from 'react-native-svg';
import { getListings } from '../lib/utils/extractListingData';
import { useMarkersMap, useSelectedMarker } from './contexts/markers';
import MapListItem from './MapListItem';

const ITEM_WIDTH = 192;
const ITEM_SPACING = 6;
const LIST_SLUGS: MapListingSlug[] = ['donations', 'requests', 'hospitals', 'milkBanks'];
const ICONS: Record<MapListingSlug, LucideIcon | FC<SvgProps>> = {
  donations: HandBottleIcon,
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
  const currentCoords = useCurrentCoordinates();

  const expand = Boolean(list);

  const [_, setSelectedMarker] = useSelectedMarker();
  const markersMap = useMarkersMap();

  const { donationsListings, requestsListings } = useMemo(
    () => getListings(markersMap, currentCoords),
    [currentCoords, markersMap]
  );

  const [data, setData] = useState<MapListingItem[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  function setListParams(slug: MapListingSlug | undefined) {
    router.setParams({ list: slug } as MapQueryParams);
  }

  function setMarkerID({ markerID }: MapListingItem) {
    setSelectedMarker(markerID);
  }

  useEffect(() => {
    if (!expand) return;

    if (list === 'donations' && donationsListings) {
      setData(donationsListings);
    } else if (list === 'requests' && requestsListings) {
      setData(requestsListings);
    } else {
      setData([]);
    }
  }, [list, donationsListings, requestsListings, expand]);

  return (
    <Box pointerEvents="box-none">
      <LocateButton className="mx-4 mb-4 self-end" />

      <CollapsibleView expand={expand}>
        <BasicCarousel
          data={data}
          itemWidth={ITEM_WIDTH}
          itemSpacing={ITEM_SPACING}
          contentContainerClassName="px-4 py-2"
          focusedIndex={focusedIndex}
          setFocusedIndex={setFocusedIndex}
          renderItem={({ item, isFocused, index }) => (
            <MapListItem
              width={ITEM_WIDTH}
              height={128}
              item={item}
              isFocused={isFocused}
              onPress={() => {
                setMarkerID(item);
                setFocusedIndex(index);
              }}
            />
          )}
        />
      </CollapsibleView>

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
