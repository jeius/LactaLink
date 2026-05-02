import { Box } from '@/components/ui/box';
import Sheet, { SheetProps } from '@/components/ui/sheet';
import { SheetRef } from '@/components/ui/sheet/Sheet';
import { Text } from '@/components/ui/text';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DataMarker } from '../../lib/types';
import { useDirectionIsActive } from '../contexts/directions';
import { useSelectedMarker } from '../contexts/markers';
import CallToAction from './CallToAction';
import DeliveryPreferenceCard from './DeliveryPreferenceCard';
import { DonationDetails, RequestDetails } from './Details';

export default function MarkerDetailsSheet({
  onDidDismiss,
  ...props
}: Omit<SheetProps, 'detents' | 'dimmed'>) {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<SheetRef>(null);

  const isDirectionMode = useDirectionIsActive();
  const [dataMarker, setDataMarker] = useSelectedMarker();

  const [footerHeight, setFooterHeight] = useState(0);

  if (!dataMarker || isDirectionMode) {
    // Don't render the sheet if no marker is selected or if we're in direction mode
    return null;
  }

  return (
    <Sheet
      {...props}
      ref={sheetRef}
      detents={['auto']}
      dimmed={false}
      initialDetentIndex={0}
      headerClassName="bg-background-0"
      backgroundColorClassName="bg-background-50"
      footerStyle={{ paddingBottom: insets.bottom }}
      onDidDismiss={(e) => {
        setDataMarker(null);
        onDidDismiss?.(e);
      }}
      insetAdjustment="never"
      footer={
        <CallToAction
          {...dataMarker}
          onLayout={({ nativeEvent }) => setFooterHeight(nativeEvent.layout.height)}
          className="px-4 py-2"
        />
      }
    >
      <Details {...dataMarker} />

      {dataMarker.deliveryPreference && (
        <Box className="py-4">
          <DeliveryPreferenceCard data={dataMarker.deliveryPreference} marker={dataMarker.marker} />
        </Box>
      )}

      {/* Footer space */}
      <Box style={{ height: footerHeight }} />
    </Sheet>
  );
}

function Details({ data }: DataMarker) {
  switch (data.relationTo) {
    case 'donations':
      return <DonationDetails data={data.value as Donation} />;
    case 'requests':
      return <RequestDetails data={data.value as Request} />;
    default:
      return (
        <Box className="flex-1 items-center justify-center">
          <Text>No details available</Text>
        </Box>
      );
  }
}
