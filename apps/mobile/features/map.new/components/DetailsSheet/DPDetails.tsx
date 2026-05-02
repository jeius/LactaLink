import { BasicBadge } from '@/components/badges';
import DeliveryModeIcons, { DeliveryModeIcon } from '@/components/DeliveryModeIcons';
import TruncatedText from '@/components/TruncatedText';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import ScrollView from '@/components/ui/ScrollView';
import Sheet from '@/components/ui/sheet';
import { SheetRef } from '@/components/ui/sheet/Sheet';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { DELIVERY_OPTIONS, ShortDays } from '@lactalink/enums';
import { Collection } from '@lactalink/types/collections';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import {
  CalendarDaysIcon,
  LocateFixedIcon,
  MapPinIcon,
  RouteIcon,
  TruckIcon,
} from 'lucide-react-native';
import { useRef } from 'react';
import { DataMarkerSlug, MapMarker } from '../../lib/types';
import { createMarkerSnippet } from '../../lib/utils/markerUtils';
import { useStartNavigation } from '../contexts/directions';

interface Props<TSlug extends DataMarkerSlug> {
  parentDoc: { relationTo: TSlug; value: Collection<TSlug> };
  data: DeliveryPreference;
  onLocate?: (marker: MapMarker) => void;
}

export default function DPDetails<TSlug extends DataMarkerSlug>({
  data: item,
  parentDoc: parentCollection,
  onLocate,
}: Props<TSlug>) {
  const sheetRef = useRef<SheetRef>(null);

  const address = extractCollection(item.address);
  const addressName = address?.displayName || 'Unknown Location';
  const addressLoc = address?.coordinates ? pointToLatLng(address.coordinates) : null;

  const showDirections = useStartNavigation({
    destination: addressLoc ? { coordinates: addressLoc, name: addressName } : null,
    doc: parentCollection,
  });

  function handleLocate() {
    if (!addressLoc) return;
    const doc = parentCollection.value;
    const marker: MapMarker = {
      id: doc.id,
      type: parentCollection.relationTo,
      coordinate: addressLoc,
      deliveryPreferenceId: item.id,
      title: 'title' in doc ? doc.title : doc.displayName || doc.name,
      snippet: createMarkerSnippet(doc),
    };
    onLocate?.(marker);
  }

  function handlePress() {
    sheetRef.current?.present();
  }

  return (
    <>
      <Pressable
        onPress={handlePress}
        className="border-b border-outline-200 bg-background-0 px-4 py-3"
      >
        <Box className="flex-row items-center gap-3">
          <VStack space="xs" className="flex-1">
            <HStack space="sm">
              <DeliveryModeIcons modes={item.preferredMode} isDisabled />
            </HStack>

            <HStack space="xs">
              <Icon as={MapPinIcon} />
              <TruncatedText initialLines={2} size="sm" containerClassName="flex-1">
                {addressName}
              </TruncatedText>
            </HStack>
          </VStack>

          <Box>
            <Button
              action="default"
              variant="ghost"
              size="sm"
              className="h-fit w-fit flex-col gap-0 rounded-2xl bg-typography-50 p-3"
              accessibilityLabel="Show Directions"
              onPress={showDirections}
            >
              <ButtonIcon as={RouteIcon} className="h-6 w-6" />
              <ButtonText>Directions</ButtonText>
            </Button>
          </Box>
        </Box>
      </Pressable>

      <Sheet ref={sheetRef} scrollable detents={[0.55]} dimmed={false}>
        <ScrollView nestedScrollEnabled>
          <VStack className="px-5 py-4" space="md">
            <Text bold size="lg">
              {item.name || 'Delivery Preference'}
            </Text>

            <Divider />

            {/* Preferred Modes */}
            <VStack space="sm">
              <HStack space="sm" className="items-center">
                <Icon as={TruckIcon} size="sm" className="text-typography-400" />
                <Text size="xs" className="font-JakartaMedium text-typography-400">
                  Preferred Modes
                </Text>
              </HStack>
              <HStack space="xl" className="items-center">
                {item.preferredMode.map((mode) => (
                  <VStack key={mode} space="xs" className="items-center">
                    <DeliveryModeIcon mode={mode} isDisabled />
                    <Text size="xs" className="font-JakartaMedium">
                      {DELIVERY_OPTIONS[mode].label}
                    </Text>
                  </VStack>
                ))}
              </HStack>
            </VStack>

            <Divider />

            {/* Address */}
            <VStack space="xs">
              <HStack space="sm" className="items-start">
                <Icon as={MapPinIcon} size="sm" className="text-typography-400" />
                <Text size="xs" className="font-JakartaMedium text-typography-400">
                  Address
                </Text>
              </HStack>
              <Text size="sm">{addressName}</Text>
            </VStack>

            <Divider />

            {/* Available Days */}
            <VStack space="sm">
              <HStack space="sm" className="items-center">
                <Icon as={CalendarDaysIcon} size="sm" className="text-typography-400" />
                <Text size="xs" className="font-JakartaMedium text-typography-400">
                  Available Days
                </Text>
              </HStack>
              <HStack space="xs" className="flex-wrap">
                {item.availableDays.map((day) => (
                  <BasicBadge key={day} action="primary" size="sm" text={ShortDays[day]} />
                ))}
              </HStack>
            </VStack>

            <Divider />

            {/* Actions */}
            <HStack space="sm">
              <Button
                className="flex-1"
                variant="outline"
                onPress={handleLocate}
                accessibilityLabel="Locate on Map"
              >
                <ButtonIcon as={LocateFixedIcon} />
                <ButtonText>Locate</ButtonText>
              </Button>
              <Button
                className="flex-1"
                onPress={showDirections}
                accessibilityLabel="Show Directions"
              >
                <ButtonIcon as={RouteIcon} />
                <ButtonText>Directions</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </ScrollView>
      </Sheet>
    </>
  );
}
