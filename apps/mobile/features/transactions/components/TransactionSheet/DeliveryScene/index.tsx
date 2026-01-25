import React from 'react';

import { DeliveryCard } from '@/components/cards/DeliveryCard';
import { BottomSheetScrollView } from '@/components/ui/bottom-sheet';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { extractDeliveryPlan } from '@/features/transactions/lib/extractors';
import { SceneProps } from '@/lib/types/tab-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { useTransactionContext } from '../../context';
import { TransactionMessageCard } from '../../TransactionMessageCard';
import { DeliveryPlan, ProposeButton } from './_components';

export default function DeliveryScene(props: SceneProps) {
  const transaction = useTransactionContext();

  const deliveryPlan = extractDeliveryPlan(transaction);
  const deliveryDetail = extractCollection(transaction.deliveryDetails?.docs?.[0]);

  const isRejected = deliveryPlan && deliveryPlan.status === 'REJECTED';

  return (
    <BottomSheetScrollView>
      <VStack space="xl" className="p-5">
        {deliveryDetail ? (
          <VStack space="md">
            <Text bold size="lg">
              Delivery Details
            </Text>
            <DeliveryCard data={deliveryDetail} />
          </VStack>
        ) : deliveryPlan ? (
          <VStack space="md">
            <Text bold size="lg">
              Delivery Plan
            </Text>

            <DeliveryPlan item={deliveryPlan} />

            {isRejected && (
              <Box className="items-center">
                <ProposeButton size="md" label="Propose a new delivery plan" />
              </Box>
            )}
          </VStack>
        ) : (
          <VStack space="xl" className="items-center" style={{ paddingVertical: 32 }}>
            <Text className="font-JakartaMedium">This transaction has no delivery plan yet.</Text>
            <ProposeButton size="md" label="Propose a delivery plan" />
          </VStack>
        )}
        <TransactionMessageCard transaction={transaction} variant="filled" />
      </VStack>
    </BottomSheetScrollView>
  );
}
