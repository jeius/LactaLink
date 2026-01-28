import { AnimatedPressable } from '@/components/animated/pressable';
import DonationCard from '@/components/cards/DonationCard';
import { MilkBagCard } from '@/components/cards/MilkBagCard';
import RequestCard from '@/components/cards/RequestCard';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack, VStackProps } from '@/components/ui/vstack';
import { TRANSACTION_TYPE } from '@lactalink/enums';
import { displayVolume } from '@lactalink/utilities';
import { extractCollection, extractDisplayName } from '@lactalink/utilities/extractors';
import { isDonation } from '@lactalink/utilities/type-guards';
import { Link } from 'expo-router';
import { isString } from 'lodash';
import React, { useMemo } from 'react';
import { useTransactionContext } from '../context';

export default function TransactionDetails({ space = 'md', ...props }: VStackProps) {
  const transaction = useTransactionContext();

  const milkBags = useMemo(() => extractCollection(transaction.milkBags), [transaction.milkBags]);

  const details = useMemo(() => {
    const { sender, recipient, donation, request, volume, txn, type } = transaction;
    return {
      'Transaction no.': txn,
      Volume: displayVolume(volume),
      Sender: extractDisplayName({ profile: sender }),
      Recipient: extractDisplayName({ profile: recipient }),
      Type: TRANSACTION_TYPE[type].label,
      Donation: extractCollection(donation),
      Request: extractCollection(request),
      'Milk Bags': milkBags,
    };
  }, [transaction, milkBags]);

  return (
    <VStack space={space} {...props}>
      <Text bold size="lg" className="mb-2">
        Transaction Details
      </Text>
      {Object.entries(details).map(([key, value], idx) =>
        value === null ? null : isString(value) ? (
          <HStack key={idx} space="sm" className="items-center">
            <Text className="font-JakartaMedium">{key + ':'}</Text>
            <Text className="font-JakartaSemiBold">{value}</Text>
          </HStack>
        ) : (
          <VStack key={idx}>
            <Text className="mb-1 font-JakartaSemiBold">{key}</Text>
            {Array.isArray(value) ? (
              <VStack space="sm">
                {value.map((item, index) => (
                  <MilkBagCard key={index} data={item} orientation="horizontal" />
                ))}
              </VStack>
            ) : isDonation(value) ? (
              <Link href={`/donations/${value.id}`} push asChild>
                <AnimatedPressable className="overflow-hidden rounded-2xl">
                  <DonationCard data={value} />
                </AnimatedPressable>
              </Link>
            ) : (
              <Link href={`/requests/${value.id}`} push asChild>
                <AnimatedPressable className="overflow-hidden rounded-2xl">
                  <RequestCard data={value} />
                </AnimatedPressable>
              </Link>
            )}
          </VStack>
        )
      )}
    </VStack>
  );
}
