import { Box } from '@/components/ui/box';
import ScrollView from '@/components/ui/ScrollView';
import Sheet from '@/components/ui/sheet';
import { SheetProps, SheetRef } from '@/components/ui/sheet/Sheet';
import { Spinner } from '@/components/ui/spinner';
import { Collection } from '@lactalink/types/collections';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DataMarkerSlug, MapMarker } from '../../lib/types';
import CallToAction from './CallToAction';
import Details from './Details';
import DPDetails from './DPDetails';

export interface DetailsSheetProps<TSlug extends DataMarkerSlug> extends Pick<
  SheetProps,
  'onDidDismiss' | 'initialDetentIndex' | 'onWillDismiss'
> {
  data: { relationTo: TSlug; value: Collection<TSlug> } | undefined;
  deliveryPreference?: DeliveryPreference | DeliveryPreference[] | null;
  isLoading?: boolean;
  onLocate?: (marker: MapMarker) => void;
}

export default function DetailsSheet<TSlug extends DataMarkerSlug>({
  data,
  deliveryPreference: dp,
  isLoading,
  onLocate,
  initialDetentIndex = 0,
  ...props
}: DetailsSheetProps<TSlug>) {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<SheetRef>(null);
  const deliveryPrefs = dp && !Array.isArray(dp) ? [dp] : dp;

  const [footerHeight, setFooterHeight] = useState(0);

  return (
    <Sheet
      {...props}
      ref={sheetRef}
      detents={[0.45, 0.7, 1]}
      scrollable
      dimmed={false}
      initialDetentIndex={initialDetentIndex}
      headerClassName="bg-background-0"
      footerClassName="bg-background-50 py-1"
      backgroundColorClassName="bg-background-50"
      footerStyle={{ paddingBottom: insets.bottom }}
      footer={
        <CallToAction
          data={data}
          isLoading={isLoading}
          className="px-4 py-2"
          onLayout={({ nativeEvent }) => {
            setFooterHeight(nativeEvent.layout.height);
          }}
        />
      }
    >
      <ScrollView nestedScrollEnabled contentContainerStyle={{ paddingBottom: footerHeight + 4 }}>
        {isLoading ? (
          <Box className="h-64 w-full items-center justify-center">
            <Spinner size={'large'} />
          </Box>
        ) : (
          data && (
            <>
              <Details {...data} />

              {deliveryPrefs &&
                deliveryPrefs.map((dp) => (
                  <DPDetails key={dp.id} data={dp} parentDoc={data} onLocate={onLocate} />
                ))}
            </>
          )
        )}
      </ScrollView>
    </Sheet>
  );
}
