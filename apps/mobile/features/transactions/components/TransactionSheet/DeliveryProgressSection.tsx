import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { DELIVERY_OPTIONS, TRANSACTION_STATUS } from '@lactalink/enums';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { CheckIcon, CircleIcon, ClockIcon, XIcon } from 'lucide-react-native';
import { extractDeliveryDetail } from '../../lib/extractors';

const CONFIRMED = TRANSACTION_STATUS.CONFIRMED.value;
const IN_TRANSIT = TRANSACTION_STATUS.IN_TRANSIT.value;
const READY_FOR_PICKUP = TRANSACTION_STATUS.READY_FOR_PICKUP.value;
const DELIVERED = TRANSACTION_STATUS.DELIVERED.value;
const COMPLETED = TRANSACTION_STATUS.COMPLETED.value;
const FAILED = TRANSACTION_STATUS.FAILED.value;
const CANCELLED = TRANSACTION_STATUS.CANCELLED.value;

type StepState = 'completed' | 'active' | 'pending' | 'failed';

type ProgressStep = {
  key: string;
  label: string;
  description: string;
};

/**
 * Returns the ordered delivery milestones for the given delivery mode.
 *
 * @param mode - The accepted delivery method
 */
function getSteps(mode: string): ProgressStep[] {
  if (mode === DELIVERY_OPTIONS.PICKUP.value) {
    return [
      {
        key: CONFIRMED,
        label: 'Delivery Confirmed',
        description: 'Milk is being prepared for pickup',
      },
      {
        key: READY_FOR_PICKUP,
        label: 'Ready for Pickup',
        description: 'Milk is ready — recipient is on the way',
      },
      {
        key: DELIVERED,
        label: 'Picked Up',
        description: 'Recipient has picked up the milk',
      },
      {
        key: COMPLETED,
        label: 'Completed',
        description: 'Transaction successfully completed',
      },
    ];
  }

  if (mode === DELIVERY_OPTIONS.MEETUP.value) {
    return [
      {
        key: CONFIRMED,
        label: 'Delivery Confirmed',
        description: 'Both parties are preparing',
      },
      {
        key: IN_TRANSIT,
        label: 'On the Way',
        description: 'Both parties heading to the meetup point',
      },
      {
        key: DELIVERED,
        label: 'Handed Over',
        description: 'Donor has handed over the milk',
      },
      {
        key: COMPLETED,
        label: 'Completed',
        description: 'Recipient received the milk',
      },
    ];
  }

  // DELIVERY (default)
  return [
    {
      key: CONFIRMED,
      label: 'Delivery Confirmed',
      description: 'Milk is being prepared for delivery',
    },
    {
      key: IN_TRANSIT,
      label: 'In Transit',
      description: 'Donor is on the way',
    },
    {
      key: DELIVERED,
      label: 'Delivered',
      description: 'Donor has delivered the milk',
    },
    {
      key: COMPLETED,
      label: 'Completed',
      description: 'Recipient received the milk',
    },
  ];
}

/**
 * Returns the index of the currently active step for the given transaction status.
 *
 * @param steps - Ordered step definitions
 * @param txnStatus - The current transaction status
 */
function getActiveStepIndex(steps: ProgressStep[], txnStatus: Transaction['status']): number {
  const idx = steps.findIndex((s) => s.key === txnStatus);
  return idx === -1 ? 0 : idx;
}

interface StepIndicatorProps {
  state: StepState;
}

function StepIndicator({ state }: StepIndicatorProps) {
  if (state === 'completed') {
    return (
      <Box className="rounded-full bg-success-500 p-2">
        <Icon as={CheckIcon} className="stroke-success-0" />
      </Box>
    );
  }

  if (state === 'active') {
    return (
      <Box className="rounded-full bg-primary-500 p-2">
        <Icon as={CircleIcon} className="stroke-primary-0" />
      </Box>
    );
  }

  if (state === 'failed') {
    return (
      <Box className="rounded-full bg-error-500 p-2">
        <Icon as={XIcon} className="stroke-error-0" />
      </Box>
    );
  }

  return (
    <Box className="rounded-full bg-background-200 p-2">
      <Icon as={ClockIcon} className="stroke-typography-400" />
    </Box>
  );
}

interface DeliveryProgressSectionProps {
  transaction: Transaction;
}

/**
 * Renders a vertical progress stepper showing the delivery milestones of a transaction.
 *
 * @description
 * The steps shown depend on the accepted delivery method (PICKUP, DELIVERY, or MEETUP).
 * The current transaction status determines which steps are completed vs. active vs. pending.
 * Renders nothing when no accepted delivery detail exists.
 *
 * @param transaction - The current transaction document
 */
export default function DeliveryProgressSection({ transaction }: DeliveryProgressSectionProps) {
  const deliveryDetail = extractDeliveryDetail(transaction);
  if (!deliveryDetail) return null;

  const steps = getSteps(deliveryDetail.method);
  const txnStatus = transaction.status;
  const isFailed = txnStatus === FAILED || txnStatus === CANCELLED;
  const isCompleted = txnStatus === COMPLETED;
  const activeIndex = getActiveStepIndex(steps, txnStatus);

  return (
    <VStack space="sm">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const state: StepState = isFailed
          ? 'failed'
          : isCompleted
            ? 'completed'
            : index < activeIndex
              ? 'completed'
              : index === activeIndex
                ? 'active'
                : 'pending';

        return (
          <HStack key={step.key} space="md" className="items-start">
            <VStack space="sm" className="items-center">
              <StepIndicator state={state} />
              {!isLast && (
                <Box
                  className={state === 'completed' ? 'bg-success-500' : 'bg-background-200'}
                  style={{ height: 20, width: 2 }}
                />
              )}
            </VStack>

            <VStack className="flex-1 pb-1">
              <Text
                size="sm"
                className={`font-JakartaSemiBold ${state === 'pending' ? 'text-typography-400' : 'text-typography-900'}`}
              >
                {step.label}
              </Text>
              <Text size="xs" className="font-JakartaMedium text-typography-500">
                {step.description}
              </Text>
            </VStack>
          </HStack>
        );
      })}
    </VStack>
  );
}
