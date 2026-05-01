import { useDeliveryPreferenceQuery, useMarkerDataQuery } from '../hooks/queries';
import { useDirectionIsActive } from './contexts/directions';
import { useSelectedMarker } from './contexts/markers';
import DetailsSheet from './DetailsSheet';

export default function MarkerDetailsSheet() {
  const isDirectionMode = useDirectionIsActive();
  const [dataMarker, setDataMarker] = useSelectedMarker();

  const { data, ...dataQuery } = useMarkerDataQuery(
    dataMarker && { id: dataMarker.data.id, type: dataMarker.data.type }
  );

  const { data: deliveryPreference, ...dpQuery } = useDeliveryPreferenceQuery(
    dataMarker?.data.deliveryPreferenceId
  );

  const isLoading = dataQuery.isLoading || dpQuery.isLoading;

  // Don't render the sheet if no marker is selected or if we're in direction mode
  if (!dataMarker || isDirectionMode) return null;

  return (
    <DetailsSheet
      isLoading={isLoading}
      data={!data ? undefined : { relationTo: dataMarker.data.type, value: data }}
      deliveryPreference={deliveryPreference}
      onDidDismiss={() => setDataMarker(null)}
    />
  );
}
