import { Transaction } from '@lactalink/types/payload-generated-types';
import { useEffect } from 'react';
import { useTransactionState } from '../hooks/useTransactionState';

/**
 *
 * Marks the given transaction as read when the component is mounted.
 */
export default function MarkReadTransaction({ transaction }: { transaction: Transaction }) {
  const { markAsSeen } = useTransactionState(transaction);

  useEffect(() => {
    markAsSeen();
  }, [transaction]);

  return null;
}
