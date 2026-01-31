import { AnimatedProgress } from '@/components/animated/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack, VStackProps } from '@/components/ui/vstack';
import React from 'react';

interface ProgressTrackerProps extends VStackProps {
  isLoading?: boolean;
  percentage: number;
  label: string;
  trackColor?: string;
}

export default function ProgressTracker({
  isLoading,
  percentage,
  trackColor,
  label,
  ...props
}: ProgressTrackerProps) {
  return (
    <VStack {...props}>
      {isLoading ? (
        <Skeleton variant="circular" className="h-3" />
      ) : (
        <>
          <AnimatedProgress
            size="sm"
            orientation="horizontal"
            value={percentage}
            trackColor={trackColor}
          />
          <Text size="xs" className="mt-1 text-center text-typography-700">
            {label}
          </Text>
        </>
      )}
    </VStack>
  );
}
