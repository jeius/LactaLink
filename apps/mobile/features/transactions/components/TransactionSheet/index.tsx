import React from 'react';

import {
  BottomSheet,
  BottomSheetPortal,
  BottomSheetScrollView,
} from '@/components/ui/bottom-sheet';
import { BottomSheetPortalProps, BottomSheetProps } from '@/components/ui/bottom-sheet/types';
import { BottomSheetHandle } from '@/components/ui/BottomSheetHandle';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { TransactionChatCard } from './TransactionChatCard';
import TransactionDetails from './TransactionDetails';

interface TransactionSheetProps
  extends Pick<BottomSheetPortalProps, 'animatedPosition' | 'snapPoints'>,
    Pick<BottomSheetProps, 'snapToIndex'> {
  transaction: Transaction;
}

export function TransactionSheet({ transaction, ...props }: TransactionSheetProps) {
  return (
    <BottomSheet snapToIndex={props.snapToIndex} disableClose>
      <BottomSheetPortal
        {...props}
        handleComponent={BottomSheetHandle}
        enableContentPanningGesture={true}
        enableDynamicSizing={false}
        animateOnMount={true}
        backgroundStyle={{ backgroundColor: 'transparent' }}
        enableOverDrag={false}
      >
        <BottomSheetScrollView
          contentContainerClassName="bg-background-0 gap-8 pb-5 px-4 grow"
          showsVerticalScrollIndicator={false}
        >
          <TransactionChatCard transaction={transaction} />
          <TransactionDetails />
        </BottomSheetScrollView>
      </BottomSheetPortal>
    </BottomSheet>
  );
}
