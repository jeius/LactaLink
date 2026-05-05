import { Box, BoxProps } from '@/components/ui/box';
import { getLottieAsset } from '@/lib/stores/assetsStore';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Transaction } from '@lactalink/types/payload-generated-types';
import LottieView, { AnimationObject } from 'lottie-react-native';

const ANIMATED_ICON: Record<Transaction['status'], { source: AnimationObject }> = {
  PENDING: { source: getLottieAsset('timeLoader') },
  CONFIRMED: { source: getLottieAsset('confirmed') },
  PREPARING: { source: getLottieAsset('orderPacked') },
  COMPLETED: { source: getLottieAsset('confirmed') },
  CANCELLED: { source: getLottieAsset('cancelled') },
  DELIVERED: { source: getLottieAsset('receivePackage') },
  READY_FOR_PICKUP: { source: getLottieAsset('receivePackage') },
  IN_TRANSIT: { source: getLottieAsset('areaMap') },
  FAILED: { source: getLottieAsset('cancelled') },
};

const statusBadgeStyle = tva({
  base: 'h-20 w-20 items-center justify-center rounded-full border-4 border-primary-500 bg-typography-50',
});

interface StatusBadgeProps extends BoxProps {
  status: Transaction['status'];
}

export function StatusIcon({ status, className, ...props }: StatusBadgeProps) {
  return (
    <Box {...props} className={statusBadgeStyle({ className })}>
      <LottieView
        autoPlay
        loop
        source={ANIMATED_ICON[status].source}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    </Box>
  );
}
