import { useMeUser } from '@/hooks/auth/useAuth';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { useDeliveryMutations } from '@/hooks/mutations/useDeliveryMutations';
import { getLottieAsset } from '@/lib/stores/assetsStore';
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { getLatestDeliveryProposal } from '@/lib/utils/getLatestDeliveryProposal';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { DELIVERY_OPTIONS, TRANSACTION_STATUS } from '@lactalink/enums';
import {
  ConfirmedDelivery,
  ProposedDelivery,
  Transaction,
  User,
} from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { formatDate, formatLocaleTime } from '@lactalink/utilities/formatters';
import isEqual from 'lodash/isEqual';
import LottieView, { AnimationObject } from 'lottie-react-native';
import {
  CalendarDaysIcon,
  CheckIcon,
  MapPinIcon,
  MessageCircleIcon,
  PlusIcon,
  XIcon,
} from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ProfileAvatar } from '../Avatar';
import { Image } from '../Image';
import { Box, BoxProps } from '../ui/box';
import { Button, ButtonIcon, ButtonProps, ButtonText } from '../ui/button';
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

const agreementsAvatarStyle = tva({
  base: 'bg-background-300 border-background-300 aspect-square w-10 rounded-full border-2',
  variants: {
    agreed: {
      true: 'border-success-400',
      false: 'border-error-400',
      undefined: 'border-background-300',
    },
  },
});

const statusBadgeStyle = tva({
  base: 'bg-primary-0 border-primary-500 h-20 w-20 items-center justify-center rounded-full border-2',
});

interface DeliveryCardProps {
  transactionID: string;
}

export function TransactionDeliveryCard({ transactionID }: DeliveryCardProps) {
  const { data: meUser } = useMeUser();
  const { data: transaction, queryKey } = useFetchById(true, {
    collection: 'transactions',
    id: transactionID,
  });

  const isUserSender = isEqual(transaction?.sender, meUser?.profile);
  const isUserRecipient = isEqual(transaction?.recipient, meUser?.profile);

  const messageRecipient = isUserSender
    ? transaction?.recipient
    : isUserRecipient
      ? transaction?.sender
      : undefined;

  const { status = MATCHED, delivery: { confirmed } = {} } = transaction || {};

  const { latestProposal } = useMemo(() => extractData(transaction), [transaction]);

  const hasConfirmedDelivery = confirmed && Object.values(confirmed).every(Boolean);

  return (
    <Card className="flex-col items-stretch gap-2 overflow-visible p-4">
      <Text bold size="lg" className="text-primary-500">
        {TRANSACTION_STATUS[status].label}...
      </Text>

      <Divider />

      {hasConfirmedDelivery ? (
        <DeliveryInformation {...confirmed} />
      ) : latestProposal ? (
        <ProposalInformation {...latestProposal} />
      ) : (
        <Text>No delivery location and method proposed yet.</Text>
      )}

      {hasConfirmedDelivery ? (
        <MessageButton recipient={messageRecipient} className="mt-2" />
      ) : latestProposal && transaction ? (
        <ProposalCTA proposal={latestProposal} transaction={transaction} queryKey={queryKey} />
      ) : (
        <MessageButton recipient={messageRecipient} />
      )}

      <StatusBadge
        status={status}
        className="absolute right-0 top-0"
        style={{ transform: [{ translateY: -24 }, { translateX: 12 }] }}
      />
    </Card>
  );
}

function StatusBadge({
  status,
  className,
  ...props
}: { status: Transaction['status'] } & BoxProps) {
  return (
    <Box {...props} className={statusBadgeStyle({ className })}>
      <LottieView
        autoPlay
        loop
        source={ANIMATED_ICON[status].source}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    </Box>
  );
}

function DeliveryInformation({
  address,
  datetime,
  mode,
}: Pick<ConfirmedDelivery, 'address' | 'datetime' | 'mode'>) {
  const deliveryModeLabel = DELIVERY_OPTIONS[mode].label;
  const deliveryModeIcon = getDeliveryPreferenceIcon(mode);
  const deliveryDateLabel = `${formatDate(datetime)}, ${formatLocaleTime(datetime)}`;
  const deliveryAddress = extractCollection(address)?.displayName || 'Address not available';

  return (
    <VStack space="sm" className="items-stretch">
      <HStack space="sm" className="items-center">
        <Box className="border-primary-500 rounded-full border p-1">
          <Image source={deliveryModeIcon} style={{ width: 16, height: 16 }} />
        </Box>
        <Text size="sm" className="font-JakartaMedium">
          {deliveryModeLabel}
        </Text>
      </HStack>

      <HStack space="xs" className="items-start">
        <Icon
          size="sm"
          as={CalendarDaysIcon}
          className="fill-primary-50 text-primary-500"
          style={{ marginTop: 2 }}
        />
        <Text
          size="sm"
          ellipsizeMode="tail"
          numberOfLines={2}
          className="font-JakartaMedium flex-1"
        >
          {deliveryDateLabel}
        </Text>
      </HStack>

      <HStack space="xs" className="items-start">
        <Icon
          size="sm"
          as={MapPinIcon}
          className="fill-primary-50 text-primary-500"
          style={{ marginTop: 2 }}
        />
        <VStack className="flex-1">
          <Text size="sm" ellipsizeMode="tail" numberOfLines={2} className="font-JakartaMedium">
            {deliveryAddress}
          </Text>
        </VStack>
      </HStack>
    </VStack>
  );
}

function ProposalInformation({
  id,
  address,
  datetime,
  mode,
  agreements: { recipient, sender } = {},
}: NonNullable<ProposedDelivery>[number]) {
  const { data: meUser } = useMeUser();
  const isUserSender = isEqual(sender?.agreedBy, meUser?.profile);
  const isUserRecipient = isEqual(recipient?.agreedBy, meUser?.profile);

  const messageRecipient = isUserSender
    ? recipient?.agreedBy
    : isUserRecipient
      ? sender?.agreedBy
      : undefined;

  const parties = [sender, recipient].filter((v) => v !== undefined);

  return (
    <>
      <DeliveryInformation address={address} datetime={datetime} mode={mode} />

      <HStack space="md" className="mt-2 items-end justify-between">
        <VStack space="xs">
          <Text size="xs" className="font-JakartaSemiBold">
            Agreed:
          </Text>
          <HStack space="sm" className="items-center">
            {parties.map(({ agreed, agreedBy }, idx) => (
              <Box
                key={idx}
                className={agreementsAvatarStyle({
                  agreed: agreedBy === undefined ? undefined : !!agreed,
                })}
              >
                {agreedBy && <ProfileAvatar className="h-full w-full" profile={agreedBy} />}
              </Box>
            ))}
          </HStack>
        </VStack>

        <MessageButton recipient={messageRecipient} />
      </HStack>
    </>
  );
}

interface ProposalCTAProps {
  proposal: NonNullable<ProposedDelivery>[number];
  transaction: Transaction;
  queryKey: unknown[];
}

function ProposalCTA({ proposal, transaction, queryKey }: ProposalCTAProps) {
  const { data: meUser } = useMeUser();
  const { agreeMutation, disagreeMutation } = useDeliveryMutations(transaction, queryKey);

  const isUserSender = isEqual(proposal.agreements?.sender?.agreedBy, meUser?.profile);
  const isUserRecipient = isEqual(proposal.agreements?.recipient?.agreedBy, meUser?.profile);

  const senderAgreed = proposal.agreements?.sender?.agreed;
  const recipientAgreed = proposal.agreements?.recipient?.agreed;

  const disableAgreeButton = (isUserSender && senderAgreed) || (isUserRecipient && recipientAgreed);
  const disableRejectButton =
    (isUserSender && senderAgreed === false) || (isUserRecipient && recipientAgreed === false);

  function handleAgree() {
    if (!proposal.id) {
      console.warn('Unable to agree to proposal: Missing proposal ID');
      return;
    }
    agreeMutation.mutateAsync(proposal.id);
  }

  function handleReject() {
    if (!proposal.id) {
      console.warn('Unable to reject proposal: Missing proposal ID');
      return;
    }
    disagreeMutation.mutateAsync(proposal.id);
  }

  return (
    <HStack space="md" className="mt-4 items-stretch">
      <Button isDisabled={!!disableAgreeButton} action="positive" onPress={handleAgree}>
        <ButtonIcon as={CheckIcon} />
      </Button>
      <Button variant="outline" action="primary" className="flex-1" disablePressAnimation>
        <ButtonIcon as={PlusIcon} />
        <ButtonText numberOfLines={1}>Propose</ButtonText>
      </Button>
      <Button isDisabled={!!disableRejectButton} action="negative" onPress={handleReject}>
        <ButtonIcon as={XIcon} />
      </Button>
    </HStack>
  );
}

function MessageButton({
  recipient,
  size = 'sm',
  action = 'default',
  variant = 'outline',
  ...props
}: { recipient: User['profile'] } & ButtonProps) {
  const { data: meUser } = useMeUser();
  const sender = meUser?.profile;
  return (
    <Button {...props} size={size} action={action} variant={variant}>
      <ButtonIcon as={MessageCircleIcon} />
      <ButtonText>Message</ButtonText>
    </Button>
  );
}

//#region Helpers
function extractData(data: Transaction | undefined) {
  if (!data) return {};

  return {
    confirmDeliveryAddress: extractCollection(data.delivery?.confirmed?.address),
    latestProposal: getLatestDeliveryProposal(data.delivery?.proposed),
  };
}
//#endregion
