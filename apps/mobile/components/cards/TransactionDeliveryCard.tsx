import { useTransactionQuery } from '@/hooks/transactions/fetcher';
import { createShadow } from '@/lib/utils/shadows';
import { TRANSACTION_STATUS } from '@lactalink/enums';
import { displayVolume } from '@lactalink/utilities';
import React from 'react';
import { TransactionStatusBadge } from '../badges/TransactionStatusBadge';
import { Card, CardProps } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

const PENDING = TRANSACTION_STATUS.PENDING_DELIVERY_CONFIRMATION.value;

interface TransactionStatusCardProps extends CardProps {
  transactionID: string;
}

export function TransactionStatusCard({ transactionID, ...props }: TransactionStatusCardProps) {
  const { data: transaction, isLoading } = useTransactionQuery(transactionID);

  const { status = PENDING } = transaction || {};

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
        {isLoading ? (
          <>
            <Skeleton variant="rounded" className="mb-1 h-9 w-32" />
            <Skeleton variant="rounded" className="h-5 w-40" />
          </>
        ) : (
          <>
            <Text size="3xl" className="font-JakartaExtraBold">
              {displayVolume(transaction?.matchedVolume || 0)}
            </Text>
            <Text size="sm" className="font-JakartaSemiBold">
              {TRANSACTION_STATUS[status].label}
            </Text>
          </>
        )}
      </VStack>

      {isLoading ? (
        <Skeleton variant="circular" className="h-20 w-20" />
      ) : (
        <TransactionStatusBadge status={status} />
      )}
    </Card>
  );
}
