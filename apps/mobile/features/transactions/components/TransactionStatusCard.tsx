import { Card, CardProps } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { createShadow } from '@/lib/utils/shadows';
import { TRANSACTION_STATUS } from '@lactalink/enums';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { displayVolume } from '@lactalink/utilities';
import React from 'react';
import { TransactionStatusBadge } from './TransactionStatusBadge';

interface TransactionStatusCardProps extends CardProps {
  transaction: Transaction;
}

export default function TransactionStatusCard({
  transaction,
  ...props
}: TransactionStatusCardProps) {
  const { status } = transaction;

  return (
    <Card
      {...props}
      className="flex-row items-center gap-2 overflow-visible p-2"
      style={[
        {
          borderRadius: 52,
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
          ...createShadow(0.08).md,
        },
        props.style,
      ]}
    >
      <VStack className="ml-3 flex-1 py-2">
        <Text size="3xl" className="font-JakartaExtraBold">
          {displayVolume(transaction?.volume || 0)}
        </Text>
        <Text size="sm" className="font-JakartaSemiBold">
          {TRANSACTION_STATUS[status].label}
        </Text>
      </VStack>

      <TransactionStatusBadge status={status} />
    </Card>
  );
}
