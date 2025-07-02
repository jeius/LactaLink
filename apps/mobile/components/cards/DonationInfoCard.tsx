import { COLLECTION_MODES, STORAGE_TYPES } from '@/lib/constants';
import { segregateMilkBags } from '@/lib/utils/segregateMilkBags';

import { Donation, MilkBag } from '@lactalink/types';
import { MilkIcon } from 'lucide-react-native';
import React, { useMemo } from 'react';

import { AnimatedProgress } from '../animated/progress';
import { Box } from '../ui/box';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

interface DonationInfoCardProps {
  data: Donation;
}

export function DonationInfoCard({ data }: DonationInfoCardProps) {
  const {
    details: { bags, collectionMode, storageType, milkSample, notes },
    donor,
    deliveryDetails,
    remainingVolume,
    status,
    volume,
  } = data;

  const progressValue = remainingVolume && volume ? (remainingVolume / volume) * 100 : 0;

  const availableBags = useMemo(
    () => (bags as MilkBag[]).filter((bag) => bag.status === 'AVAILABLE'),
    [bags]
  );
  const segregatedBags = useMemo(() => segregateMilkBags(bags as MilkBag[]), [bags]);

  return (
    <Card className="w-full">
      <VStack space="md">
        <VStack>
          <Text size="sm" className="mb-1">
            Available Volume
          </Text>
          <HStack space="sm" className="items-center">
            <Icon as={MilkIcon} size="sm" className="text-primary-500" />
            <Box className="flex-1">
              <AnimatedProgress value={progressValue} size="sm" />
            </Box>
          </HStack>
          {remainingVolume && volume && (
            <Text size="xs" className="text-typography-600 text-center">
              {remainingVolume} / {volume} mL
            </Text>
          )}
        </VStack>

        <VStack className="mb-1">
          <Text size="sm" className="mb-1">
            Milk Bags
          </Text>
          <HStack space="sm" className="flex-wrap">
            {Object.entries(segregatedBags).map(([key, bags]) => {
              const isExpired = bags.some((bag) => bag.status === 'EXPIRED');
              return (
                <Box
                  key={key}
                  className={`${isExpired ? 'bg-background-200' : 'bg-primary-100'} mb-2 mr-2 rounded-md px-2 py-1`}
                >
                  <Text size="xs" strikeThrough={isExpired} className="text-primary-800">
                    {bags.length} x {key} mL
                  </Text>
                </Box>
              );
            })}
          </HStack>
        </VStack>

        <Text size="sm" className="mb-1">
          Collection Method:{' '}
          <Text size="sm" className="text-primary-500 font-JakartaSemiBold">
            {COLLECTION_MODES[collectionMode].label}
          </Text>
        </Text>

        <Text size="sm" className="mb-1">
          Storage Type:{' '}
          <Text size="sm" className="text-primary-500 font-JakartaSemiBold">
            {STORAGE_TYPES[storageType].label}
          </Text>
        </Text>
      </VStack>
    </Card>
  );
}
