import { Box } from '@/components/ui/box';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Card, CardProps } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { createShadow } from '@/lib/utils/shadows';
import { DELIVERY_OPTIONS, TRANSACTION_STATUS } from '@lactalink/enums';
import { DeliveryDetail, Transaction } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { formatDate, formatLocaleTime } from '@lactalink/utilities/formatters';
import { MapPinIcon } from 'lucide-react-native';
import React from 'react';
import { createUpdatesMessage } from '../lib/createUpdatesMessage';
import { extractDeliveryDetail, extractDeliveryPlan } from '../lib/extractors';
import DeliveryPlan from './DeliveryPlan';
import ProposeButton from './ProposeButton';
import { TransactionStatusBadge } from './TransactionStatusBadge';

interface TransactionStatusCardProps extends CardProps {
  transaction: Transaction;
}

export default function TransactionStatusCard({
  transaction,
  ...props
}: TransactionStatusCardProps) {
  const { status } = transaction;

  const deliveryDetail = extractDeliveryDetail(transaction);
  const deliveryPlan = extractDeliveryPlan(transaction);

  const message = createUpdatesMessage(transaction);

  const title = deliveryDetail
    ? DELIVERY_OPTIONS[deliveryDetail.method].label
    : TRANSACTION_STATUS[status].label;

  const address = extractCollection(deliveryDetail?.address)?.displayName;
  const method = deliveryDetail?.method;
  const scheduleDate = deliveryDetail?.scheduledAt
    ? formatDate(deliveryDetail.scheduledAt, { shortMonth: true })
    : null;
  const scheduledTime = deliveryDetail?.scheduledAt
    ? formatLocaleTime(deliveryDetail.scheduledAt)
    : null;

  const descriptionPrefix: Record<DeliveryDetail['method'], string> = {
    DELIVERY: 'Will be delivered on',
    PICKUP: 'Ready for pickup on',
    MEETUP: 'Meet-up on',
  };

  return (
    <Card
      {...props}
      className="p-0"
      style={[
        {
          borderRadius: 16,
          borderTopRightRadius: 52,
          ...createShadow(0.08).md,
        },
        props.style,
      ]}
    >
      <HStack space="md" className="p-4">
        <VStack className="flex-1">
          <Text size="xl" className="font-JakartaExtraBold">
            {title}
          </Text>
          <Text size="sm" className="font-JakartaMedium">
            {message}
          </Text>
        </VStack>

        <TransactionStatusBadge status={status} />
      </HStack>

      {deliveryDetail ? (
        <VStack space="sm" className="bg-background-100 p-4">
          <HStack space="sm" className="items-center">
            <Button className="h-fit w-fit rounded-full p-2">
              <ButtonIcon as={MapPinIcon} />
            </Button>
            <Text size="sm" numberOfLines={2} className="font-JakartaMedium">
              {address || 'No delivery address provided.'}
            </Text>
          </HStack>

          {method && (
            <Text size="sm" className="font-JakartaMedium">
              {descriptionPrefix[method]}{' '}
              <Text size="sm" className="font-JakartaSemiBold">
                {scheduleDate}
              </Text>{' '}
              around{' '}
              <Text size="sm" className="font-JakartaSemiBold">
                {scheduledTime}
              </Text>
              .
            </Text>
          )}
        </VStack>
      ) : deliveryPlan ? (
        <DeliveryPlan data={deliveryPlan} />
      ) : (
        <Box className="px-4 pb-4">
          <ProposeButton size="md" label="Propose a delivery" />
        </Box>
      )}
    </Card>
  );
}
