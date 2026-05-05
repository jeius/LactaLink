import TruncatedText from '@/components/TruncatedText';
import { Box } from '@/components/ui/box';
import { Card, CardProps } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { createShadow } from '@/lib/utils/shadows';
import { TRANSACTION_STATUS } from '@lactalink/enums';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { useMemo } from 'react';
import { createUpdatesMessage } from '../lib/createUpdatesMessage';
import { extractDeliveryDetail, extractDeliveryPlan } from '../lib/extractors';
import DeliveryDetails from './DeliveryDetails';
import ProposeButton from './ProposeButton';
import { StatusIcon } from './StatusIcon';

interface TransactionStatusCardProps extends CardProps {
  transaction: Transaction;
}

export default function TransactionStatusCard({
  transaction,
  ...props
}: TransactionStatusCardProps) {
  const { status } = transaction;

  const confirmedDeliveryPlan = extractDeliveryDetail(transaction);
  const deliveryPlan = extractDeliveryPlan(transaction);
  const deliveryDetails = confirmedDeliveryPlan || deliveryPlan;

  const title = TRANSACTION_STATUS[status].label;
  const message = useMemo(() => createUpdatesMessage(transaction), [transaction]);

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
          <TruncatedText size="sm" className="font-JakartaMedium" initialLines={3}>
            {message}
          </TruncatedText>
        </VStack>

        <StatusIcon status={status} />
      </HStack>

      {deliveryDetails ? (
        <DeliveryDetails data={deliveryDetails} />
      ) : (
        <Box className="px-4 pb-4">
          <ProposeButton size="md" label="Propose a delivery" />
        </Box>
      )}
    </Card>
  );
}
