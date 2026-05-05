import MapView from '@/components/map/MapView';
import { TRANSACTION_STATUS } from '@lactalink/enums';
import { PropsWithChildren } from 'react';
import { useTransactionMapMarkers } from '../hooks/useTransactionMapMarkers';
import { useTransactionPolylines } from '../hooks/useTransactionPolylines';
import { useTransactionContext } from './context';
import { useOtherPartyLocation } from './contexts/LocationsProvider';

const ACTIVE_TXN_STATUSES: string[] = [
  TRANSACTION_STATUS.READY_FOR_PICKUP.value,
  TRANSACTION_STATUS.IN_TRANSIT.value,
];

interface TransactionMapViewProps {
  isActiveDelivery: boolean;
}

export default function TransactionMapView({
  isActiveDelivery,
  children,
}: PropsWithChildren<TransactionMapViewProps>) {
  const transaction = useTransactionContext();
  const otherPartyLocation = useOtherPartyLocation();

  const mapMarkers = useTransactionMapMarkers(
    transaction,
    isActiveDelivery ? otherPartyLocation : null
  );

  const showRoutes = ACTIVE_TXN_STATUSES.includes(transaction.status);

  const { polylines } = useTransactionPolylines({
    transaction,
    enabled: isActiveDelivery && showRoutes,
    otherPartyLocation,
  });

  return (
    <MapView
      mapPadding={{ top: 80, bottom: 164, left: 4, right: 4 }}
      markers={mapMarkers}
      polylines={polylines}
    >
      {children}
    </MapView>
  );
}
