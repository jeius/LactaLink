import { useFetchById } from '@/hooks/collections/useFetchById';
import { getLottieAsset } from '@/lib/stores/assetsStore';
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { getLatestDeliveryProposal } from '@/lib/utils/getLatestDeliveryProposal';
import { DELIVERY_OPTIONS, TRANSACTION_STATUS } from '@lactalink/enums';
import {
  ConfirmedDelivery,
  ProposedDelivery,
  Transaction,
} from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { formatDate, formatLocaleTime } from '@lactalink/utilities/formatters';
import LottieView, { AnimationObject } from 'lottie-react-native';
import { CalendarDaysIcon, MapPinIcon } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Image } from '../Image';
import { Box } from '../ui/box';
import { Button, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { Divider } from '../ui/divider';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

const MATCHED = TRANSACTION_STATUS.MATCHED.value;
const DELIVERY = DELIVERY_OPTIONS.DELIVERY.value;

const ANIMATED_ICON: Record<Transaction['status'], { source: AnimationObject }> = {
  MATCHED: { source: getLottieAsset('timeLoader') },
  PENDING_DELIVERY_CONFIRMATION: { source: getLottieAsset('timeLoader') },
  COMPLETED: { source: getLottieAsset('success') },
  CANCELLED: { source: getLottieAsset('success') },
  DELIVERED: { source: getLottieAsset('receivePackage') },
  READY_FOR_PICKUP: { source: getLottieAsset('receivePackage') },
  DELIVERY_SCHEDULED: { source: getLottieAsset('orderPacked') },
  IN_TRANSIT: { source: getLottieAsset('areaMap') },
  FAILED: { source: getLottieAsset('success') },
};

interface DeliveryCardProps {
  transactionID: string;
}

export default function DeliveryCard({ transactionID }: DeliveryCardProps) {
  const { data: transaction, queryKey } = useFetchById(true, {
    collection: 'transactions',
    id: transactionID,
  });

  const { status = MATCHED, delivery: { confirmedDelivery } = {} } = transaction || {};

  const { latestProposal } = useMemo(() => extractData(transaction), [transaction]);

  const hasConfirmedDelivery = confirmedDelivery && Object.values(confirmedDelivery).every(Boolean);

  return (
    <Card className="flex-col items-stretch gap-2 overflow-visible p-4">
      <Text bold size="lg" className="text-primary-500">
        {TRANSACTION_STATUS[status].label}...
      </Text>

      <Divider />

      {hasConfirmedDelivery ? (
        <DeliveryInformation {...confirmedDelivery} />
      ) : latestProposal ? (
        <ProposalInformation {...latestProposal} />
      ) : (
        <Text>No delivery location and method proposed yet.</Text>
      )}

      {hasConfirmedDelivery ? null : latestProposal ? (
        <ProposalCTA />
      ) : (
        <Button>
          <ButtonText>Propose a Delivery</ButtonText>
        </Button>
      )}

      <Box
        className="bg-primary-0 border-primary-500 absolute right-0 top-0 h-20 w-20 items-center justify-center rounded-full border-2"
        style={{ transform: [{ translateY: -24 }, { translateX: 12 }] }}
      >
        <LottieView
          autoPlay
          loop
          source={ANIMATED_ICON[status].source}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </Box>
    </Card>
  );
}

function DeliveryInformation({ address, datetime, mode }: ConfirmedDelivery) {
  const deliveryModeLabel = DELIVERY_OPTIONS[mode].label;
  const deliveryModeIcon = getDeliveryPreferenceIcon(mode);
  const deliveryDateLabel = `${formatDate(datetime)}, ${formatLocaleTime(datetime)}`;
  const deliveryAddress = extractCollection(address)?.displayName || 'Address not available';

  return (
    <>
      <HStack space="sm" className="items-center">
        <Image source={deliveryModeIcon} style={{ width: 20, height: 20 }} />
        <Text className="font-JakartaSemiBold">{deliveryModeLabel}</Text>
      </HStack>

      <HStack space="sm" className="items-center">
        <Icon as={CalendarDaysIcon} className="fill-primary-100 stroke-primary-500" />
        <Text className="font-JakartaSemiBold">{deliveryDateLabel}</Text>
      </HStack>

      <HStack space="sm" className="items-center">
        <Icon as={MapPinIcon} className="fill-primary-100 stroke-primary-500" />
        <Text className="font-JakartaSemiBold">{deliveryAddress}</Text>
      </HStack>
    </>
  );
}

function ProposalInformation({}: NonNullable<ProposedDelivery>[number]) {
  return (
    <VStack space="sm" className="items-stretch">
      <Text>Delivery Proposal</Text>
      <Text>This is a proposal for delivery.</Text>
      <Text>Please review and respond.</Text>
    </VStack>
  );
}

interface ProposalCTAProps {
  proposalID: string;
  transactionID: string;
}

function ProposalCTA() {
  return (
    <VStack space="sm" className="items-stretch">
      <Button action="positive">
        <ButtonText>Agree</ButtonText>
      </Button>
      <Button action="negative">
        <ButtonText>Disagree</ButtonText>
      </Button>
    </VStack>
  );
}

//#region Helpers
function extractData(data: Transaction | undefined) {
  if (!data) return {};

  return {
    confirmDeliveryAddress: extractCollection(data.delivery?.confirmedDelivery?.address),
    latestProposal: getLatestDeliveryProposal(data.delivery?.proposedDelivery),
  };
}
//#endregion
