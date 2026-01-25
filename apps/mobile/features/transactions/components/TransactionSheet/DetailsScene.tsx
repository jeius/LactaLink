import { SceneProps } from '@/lib/types/tab-types';
import React from 'react';

import { DonationListCard } from '@/components/cards/DonationListCard';
import { RequestListCard } from '@/components/cards/RequestListCard';
import { MilkBagList } from '@/components/lists/horizontal-flatlists';
import { BottomSheetScrollView } from '@/components/ui/bottom-sheet';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { extractCollection } from '@lactalink/utilities/extractors';
import { useTransactionContext } from '../context';

export default function DetailsScene(props: SceneProps) {
  const transaction = useTransactionContext();

  const { donation, request } = transaction;
  const milkBags = extractCollection(transaction.milkBags);

  return (
    <BottomSheetScrollView
      contentContainerClassName="flex-col gap-4 bg-background-0 py-5 grow"
      showsVerticalScrollIndicator={false}
    >
      <Text bold size="lg" className="mx-5">
        Transaction Details
      </Text>

      {donation !== null && (
        <VStack space="xs" className="px-5">
          <Text className="mb-1 font-JakartaSemiBold">Donation</Text>
          <DonationListCard className="border-primary-500" hideFooter data={donation} />
        </VStack>
      )}

      {request !== null && (
        <VStack space="xs" className="px-5">
          <Text className="mb-1 font-JakartaSemiBold">Request</Text>
          <RequestListCard className="border-tertiary-500" hideFooter data={request} />
        </VStack>
      )}

      {milkBags && <MilkBagList data={milkBags} label="Milk Bags" />}
    </BottomSheetScrollView>
  );
}
