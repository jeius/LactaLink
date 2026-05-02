import { Spinner } from '@/components/ui/spinner';
import { ComponentProps } from 'react';
import { useDirection } from './contexts/directions';
import { useMarkers } from './contexts/markers';

export default function MapSpinner({ size = 'small', ...props }: ComponentProps<typeof Spinner>) {
  const { isPending: isLoadingDirections } = useDirection();
  const { isPending: isLoadingMarkers } = useMarkers();

  const isLoading = isLoadingDirections || isLoadingMarkers;
  if (!isLoading) return null;

  return <Spinner {...props} size={size} />;
}
