import { Spinner } from '@/components/ui/spinner';
import { useDirection } from '@/features/directions/components/DirectionsProvider';
import { ComponentProps } from 'react';
import { useMarkers } from './contexts/markers';

export default function MapSpinner({ size = 'small', ...props }: ComponentProps<typeof Spinner>) {
  const { isPending: isLoadingDirections } = useDirection();
  const { isPending: isLoadingMarkers } = useMarkers();

  const isLoading = isLoadingDirections || isLoadingMarkers;
  if (!isLoading) return null;

  return <Spinner {...props} size={size} />;
}
