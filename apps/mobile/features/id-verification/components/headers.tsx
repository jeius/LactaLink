import { AnimatedProgress } from '@/components/animated/progress';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { usePagination } from '@/hooks/forms/usePagination';
import { getColor } from '@/lib/colors/getColor';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STEPS = [
  '/id-verification/id-type',
  '/id-verification/personal-info',
  '/id-verification/id-details',
  '/id-verification/review',
];

export function FormStepsHeader() {
  const inset = useSafeAreaInsets();
  const { progress } = usePagination(STEPS);
  const tintColor = getColor('primary', '0');
  const trackColor = getColor('primary', '600');

  return (
    <VStack className="bg-primary-500" style={{ paddingTop: inset.top + 4 }}>
      <HStack className="items-center p-2">
        <HeaderBackButton marginRight={16} tintColor={tintColor} style={{ marginLeft: 4 }} />
        <Text bold size="lg" style={{ color: tintColor }}>
          Verification Form
        </Text>
      </HStack>
      <AnimatedProgress
        size="xs"
        className="bg-primary-100"
        value={progress}
        trackColor={trackColor}
      />
    </VStack>
  );
}

export function Header() {
  const inset = useSafeAreaInsets();
  const tintColor = getColor('primary', '0');

  return (
    <HStack className="items-center bg-primary-500 p-2" style={{ paddingTop: inset.top + 12 }}>
      <HeaderBackButton marginRight={16} tintColor={tintColor} style={{ marginLeft: 4 }} />
      <Text bold size="lg" style={{ color: tintColor }}>
        Identity Verification
      </Text>
    </HStack>
  );
}
