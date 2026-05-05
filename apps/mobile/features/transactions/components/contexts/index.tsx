import { Coordinates } from '@lactalink/types';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { PropsWithChildren } from 'react';
import { TransactionProvider } from '../context';
import LocationsProvider from './LocationsProvider';

interface Props {
  transaction: Transaction;
  otherPartyLocation: Coordinates | null;
}
export default function TransactionContextProviders({
  transaction,
  otherPartyLocation,
  children,
}: PropsWithChildren<Props>) {
  return (
    <TransactionProvider transaction={transaction}>
      <LocationsProvider otherPartyLocation={otherPartyLocation}>{children}</LocationsProvider>
    </TransactionProvider>
  );
}
