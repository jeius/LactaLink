import { Box } from '@/components/ui/box';
import { HandBottleIcon, MilkBottlePlus2Icon } from '@/components/ui/icon/custom';
import Sheet, { SheetProps } from '@/components/ui/sheet';
import { Text } from '@/components/ui/text';
import { getColor } from '@/lib/colors/getColor';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { DidDismissEvent } from '@lodev09/react-native-true-sheet';
import React, { useCallback, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DataMarker } from '../../lib/types';
import { useDirectionIsActive } from '../contexts/directions';
import { useSelectedMarker } from '../contexts/markers';
import CallToAction from './CallToAction';
import DeliveryPreferenceCard from './DeliveryPreferenceCard';
import { DonationDetails, RequestDetails } from './Details';

const DONATE_BTN_ICON = HandBottleIcon;
const REQUEST_BTN_ICON = MilkBottlePlus2Icon;

export default function MarkerDetailsSheet({
  onDidDismiss,
  ...props
}: Omit<SheetProps, 'detents' | 'dimmed'>) {
  const insets = useSafeAreaInsets();

  const isDirectionMode = useDirectionIsActive();
  const [dataMarker, setDataMarker] = useSelectedMarker();

  const [footerHeight, setFooterHeight] = useState(0);

  const handleOnDidDismiss = useCallback(
    (e: DidDismissEvent) => {
      setDataMarker(null);
      onDidDismiss?.(e);
    },
    [onDidDismiss, setDataMarker]
  );

  if (!dataMarker || isDirectionMode) {
    // Don't render the sheet if no marker is selected or if we're in direction mode
    return null;
  }

  return (
    <Sheet
      {...props}
      detents={['auto']}
      dimmed={false}
      initialDetentIndex={0}
      backgroundColor={getColor('background', '50')}
      headerStyle={{ backgroundColor: getColor('background', '0') }}
      footerStyle={{ paddingBottom: insets.bottom }}
      onDidDismiss={handleOnDidDismiss}
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
