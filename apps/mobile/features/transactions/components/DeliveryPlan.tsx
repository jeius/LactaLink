import React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTrigger,
} from '@/components/animated/accordion';
import { ProfileAvatar } from '@/components/Avatar';
import { Image } from '@/components/Image';
import { ActionModal } from '@/components/modals/ActionModal';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAgreeMutation, useDisagreeMutation } from '@/features/transactions/hooks/mutations';
import { ProposeSearchParams } from '@/features/transactions/lib/types';
import { getColor } from '@/lib/colors';
import { ColorCategory } from '@/lib/types/colors';
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { isMeProfile } from '@/lib/utils/isMeUser';
import { DELIVERY_DETAILS_STATUS, DELIVERY_OPTIONS } from '@lactalink/enums';
import { DeliveryDetail } from '@lactalink/types/payload-generated-types';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { formatDate, formatLocaleTime } from '@lactalink/utilities/formatters';
import { useRouter } from 'expo-router';
import {
  CalendarDaysIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  MapPinIcon,
  Settings2Icon,
  XIcon,
} from 'lucide-react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useBroadcastTransaction, useTransactionContext } from './context';
import ProposeButton from './ProposeButton';

interface DeliveryPlanProps {
  data: DeliveryDetail;
  heightProgress?: SharedValue<number>;
  onPress?: () => void;
}

const AnimatedAccordionIcon = Animated.createAnimatedComponent(AccordionIcon);

export default function DeliveryPlan({ data, heightProgress }: DeliveryPlanProps) {
  const expandProgress = useSharedValue(false);

  const animatedIconStyle = useAnimatedStyle(() => {
    const rotation = withTiming(expandProgress.value ? '-180deg' : '0deg', { duration: 300 });
    return {
      transform: [{ rotate: rotation }],
    };
  });

  if (isPlaceHolderData(data)) return <Skeleton variant="rounded" className="h-64 w-full" />;

  const { scheduledAt, notes } = data;

  const method = DELIVERY_OPTIONS[data.method].label;
  const iconSource = getDeliveryPreferenceIcon(data.method);
  const time = formatLocaleTime(scheduledAt);
  const date = formatDate(scheduledAt, { shortMonth: true });
  const address = extractCollection(data.address)?.displayName || 'Unknown Address';
  const instructions = notes;

  return (
    <Accordion>
      <AccordionItem value={method} expandProgress={expandProgress} heightProgress={heightProgress}>
        <AccordionHeader>
          <AccordionTrigger className="items-center bg-background-100">
            <HStack space="sm" className="flex-1 items-center">
              <Box className="rounded-full border border-primary-500 p-1">
                <Image
                  source={iconSource}
                  alt={`${method || 'Unknown'}-icon`}
                  style={{ width: 18, height: 18 }}
                />
              </Box>
              <Text className="flex-1 font-JakartaSemiBold text-primary-500">{method}</Text>
            </HStack>
            <StatusBadge {...data} />
            <AnimatedAccordionIcon
              as={ChevronDownIcon}
              className="ml-3"
              style={animatedIconStyle}
            />
          </AccordionTrigger>
        </AccordionHeader>

        <AccordionContent className="gap-4 bg-background-100" style={{ height: 160 }}>
          {/**Schedule */}
          <HStack space="md" className="px-1">
            <HStack space="sm" className="flex-1 items-center">
              <Icon size="lg" as={CalendarDaysIcon} />
              <Text size="sm" numberOfLines={1} className="flex-1 font-JakartaMedium">
                {date}
              </Text>
            </HStack>
            <HStack space="sm" className="flex-1 items-center">
              <Icon size="lg" as={ClockIcon} />
              <Text size="sm" numberOfLines={1} className="flex-1 font-JakartaMedium">
                {time}
              </Text>
            </HStack>
          </HStack>

          {/**Location & Instructions */}
          <HStack space="sm" className="items-start">
            <Button className="h-fit w-fit rounded-full p-2">
              <ButtonIcon as={MapPinIcon} />
            </Button>
            <VStack space="xs" className="shrink">
              <Text size="sm" numberOfLines={2} className="grow font-JakartaMedium">
                {address}
              </Text>

              <Divider />

              {instructions && (
                <Text size="sm" className="grow" numberOfLines={2}>
                  {instructions}
                </Text>
              )}
            </VStack>
          </HStack>

          {/** Actions */}
          <Actions {...data} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function Actions(deliveryPlan: DeliveryDetail) {
  const router = useRouter();
  const { status, proposedBy } = deliveryPlan;

  const transaction = useTransactionContext();
  const { mutateAsync: agree, isPending: isAgreeing } = useAgreeMutation(transaction);
  const { mutateAsync: disagree, isPending: isDisagreeing } = useDisagreeMutation(transaction);

  const broadcastTxn = useBroadcastTransaction();

  const isPending = DELIVERY_DETAILS_STATUS.PENDING.value === status;
  const isDisabled = isAgreeing || isDisagreeing;

  const isMeProposer = isMeProfile(proposedBy);

  function handleAgree() {
    agree(deliveryPlan)
      .catch((err) => {
        console.error('Error agreeing to delivery proposal:', err);
        throw err;
      })
      .then((newTxn) => {
        broadcastTxn(newTxn);
      });
  }

  function handleReject() {
    disagree(deliveryPlan)
      .catch((err) => {
        console.error('Error rejecting delivery proposal:', err);
        throw err;
      })
      .then((newTxn) => {
        broadcastTxn(newTxn);
      });
  }

  function handleEditPress() {
    const params: ProposeSearchParams = {
      txnID: extractID(deliveryPlan.transaction),
      edit: 'true',
    };
    router.push({ pathname: '/transactions/propose', params });
  }

  return (
    <HStack space="md" className="items-center">
      <ProfileAvatar profile={proposedBy} size="sm" />
      <Box className="h-1 w-1 rounded-full bg-background-300" />

      {!isPending ? (
        <Box className="flex-1">
          <ProposeButton size="md" label="Propose another delivery" />
        </Box>
      ) : isMeProposer ? (
        <Button action="default" variant="outline" className="flex-1" onPress={handleEditPress}>
          <ButtonIcon as={Settings2Icon} />
          <ButtonText>Edit proposal</ButtonText>
        </Button>
      ) : (
        <>
          <ActionModal
            variant="solid"
            action="positive"
            title="Confirm Agreement"
            description="Are you sure you want to agree to this delivery option?"
            className="flex-1"
            enableSpinner={isAgreeing}
            triggerIcon={CheckIcon}
            triggerLabel="Agree"
            confirmLabel="Agree"
            onConfirm={handleAgree}
            isDisabled={isDisabled}
          />

          <ActionModal
            variant="solid"
            action="negative"
            title="Confirm Disagreement"
            description="Are you sure you want to disagree to this delivery option?"
            className="flex-1"
            enableSpinner={isDisagreeing}
            triggerIcon={XIcon}
            triggerLabel="Disagree"
            confirmLabel="Disagree"
            onConfirm={handleReject}
            isDisabled={isDisabled}
          />
        </>
      )}
    </HStack>
  );
}

function StatusBadge({ status, proposedBy }: DeliveryDetail) {
  const isMeProposer = isMeProfile(proposedBy);

  const statusDetails: Record<DeliveryDetail['status'], { label: string; color: ColorCategory }> = {
    PENDING: {
      label: isMeProposer ? 'Proposed' : 'Action Needed',
      color: isMeProposer ? 'info' : 'warning',
    },
    ACCEPTED: {
      label: isMeProposer ? 'Accepted' : 'Agreed',
      color: 'success',
    },
    REJECTED: {
      label: isMeProposer ? 'Rejected' : 'Disagreed',
      color: 'error',
    },
  };

  const { label, color } = statusDetails[status];

  return (
    <Box className="rounded-md border px-2 py-1" style={{ borderColor: getColor(color, '500') }}>
      <Text size="xs" style={{ color: getColor(color, '500') }}>
        {label.toUpperCase()}
      </Text>
    </Box>
  );
}
