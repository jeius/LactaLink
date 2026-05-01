import DeliveryModeIcons from '@/components/DeliveryModeIcons';
import TruncatedText from '@/components/TruncatedText';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { VStack } from '@/components/ui/vstack';
import { Collection } from '@lactalink/types/collections';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import { MapPinIcon, RouteIcon } from 'lucide-react-native';
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
  const address = extractCollection(item.address);
  const addressName = address?.displayName || 'Unknown Location';
  const addressLoc = address?.coordinates ? pointToLatLng(address.coordinates) : null;

  const handleShowDirections = useStartNavigation({
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

  return (
    <Pressable onPress={handleLocate}>
      <Card variant="elevated" className="flex-row items-center gap-2 rounded-none">
        <VStack space="xs" className="flex-1">
          <HStack space="sm">
            <DeliveryModeIcons modes={item.preferredMode} />
          </HStack>

          <HStack space="xs">
            <Icon as={MapPinIcon} />
            <TruncatedText initialLines={2} size="sm" containerClassName="flex-1">
              {addressName}
            </TruncatedText>
          </HStack>
        </VStack>

        <Button
          action="info"
          className="h-fit w-fit rounded-full p-3"
          accessibilityLabel="Show Directions"
          onPress={handleShowDirections}
        >
          <ButtonIcon as={RouteIcon} className="h-6 w-6" />
        </Button>
      </Card>
    </Pressable>
  );
}
