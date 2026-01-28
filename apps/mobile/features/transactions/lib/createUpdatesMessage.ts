import { getMeUser } from '@/lib/stores/meUserStore';
import { isMeProfile } from '@/lib/utils/isMeUser';
import {
  DELIVERY_DETAILS_STATUS,
  DELIVERY_OPTIONS,
  DELIVERY_UPDATES,
  TRANSACTION_STATUS,
} from '@lactalink/enums';
import { DeliveryMode } from '@lactalink/types';
import { DeliveryUpdate, Transaction } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractName } from '@lactalink/utilities/extractors';
import { extractDeliveryDetail, extractDeliveryPlan, extractDeliveryUpdate } from './extractors';
import { getOtherParty } from './getOtherParty';

type CreateMsgParams = {
  deliveryUpdate: DeliveryUpdate;
  otherPartyName: string;
  method: DeliveryMode;
};

const PlanStatus = DELIVERY_DETAILS_STATUS;
const TransactionStatus = TRANSACTION_STATUS;
const Updates = DELIVERY_UPDATES;

// Constants for common messages
const MESSAGES = {
  NO_DELIVERY: 'Delivery has been scheduled but details are missing.',
  MILK_PREPARATION: {
    SENDER: 'Please prepare the milk as soon as possible.',
    RECIPIENT: (name: string) => `Please wait for ${name} to prepare the milk.`,
  },
  SAFETY: {
    STAY_SAFE: 'Please stay safe!',
    CHECK_IN: (name: string) => `You may want to check in with ${name} for updates.`,
  },
  COMPLETION: {
    SUCCESS: 'Thank you for completing the transaction successfully!',
    THANK_YOU: (name: string) => `${name}, appreciates the milk received. Thank you!`,
  },
  ISSUES: {
    CANCELLED: `The transaction has been cancelled.`,
    FAILED: (otherPartyName: string, method: DeliveryMode) => {
      switch (method) {
        case 'DELIVERY':
          return `${otherPartyName} was unable to deliver the milk. Please contact them for further information.`;
        case 'PICKUP':
          return `${otherPartyName} was unable to pick up the milk. Please contact them for further information.`;
        case 'MEETUP':
        default:
          return `${otherPartyName} was unable to meet up. Please contact them for further information.`;
      }
    },
    DELAYED: (name: string) =>
      `${name} is experiencing a delay. Please check in with them for updates.`,
  },
} as const;

export function createUpdatesMessage(transaction: Transaction): string {
  const meUser = getMeUser();

  const confirmedDelivery = extractDeliveryDetail(transaction);
  const deliveryPlan = extractDeliveryPlan(transaction);

  const otherParty = getOtherParty(transaction);
  const otherPartyName = extractName({ profile: otherParty }) ?? 'Unknown User';
  const otherPartyDoc = extractCollection(otherParty.value);

  const myUpdate = meUser ? extractDeliveryUpdate(transaction, meUser) : null;
  const otherPartyUpdate = otherPartyDoc?.owner
    ? extractDeliveryUpdate(transaction, otherPartyDoc.owner)
    : null;

  const isMeSender = isMeProfile(transaction.sender);
  const isMeRecipient = isMeProfile(transaction.recipient);

  const defaultMessage = `No updates from ${otherPartyName} yet.`;

  if (confirmedDelivery) {
    const transactionStatus = transaction.status;
    const deliveryMode = confirmedDelivery.method;

    switch (transactionStatus) {
      case TransactionStatus.DELIVERED.value:

      case TransactionStatus.COMPLETED.value:
        return isMeSender
          ? MESSAGES.COMPLETION.THANK_YOU(otherPartyName)
          : MESSAGES.COMPLETION.SUCCESS;

      case TransactionStatus.CANCELLED.value: {
        let cancellerName: string | null = null;

        if (myUpdate?.status === Updates.CANCELLED.value) {
          cancellerName = 'You';
        } else if (otherPartyUpdate?.status === Updates.CANCELLED.value) {
          cancellerName = otherPartyName;
        }

        return cancellerName
          ? `${cancellerName} have cancelled the transaction. You may want to reach out to ${otherPartyName} for more details.`
          : MESSAGES.ISSUES.CANCELLED;
      }

      default:
        return isMeSender
          ? myUpdate
            ? createSenderUpdates({
                deliveryUpdate: myUpdate,
                method: deliveryMode,
                otherPartyName,
              })
            : defaultMessage
          : otherPartyUpdate
            ? createRecipientUpdates({
                deliveryUpdate: otherPartyUpdate,
                method: deliveryMode,
                otherPartyName,
              })
            : defaultMessage;
    }
  } else if (deliveryPlan) {
    const status = deliveryPlan.status;
    const isMeProposer = isMeProfile(deliveryPlan.proposedBy);

    switch (status) {
      case PlanStatus.PENDING.value:
        return isMeProposer
          ? `You proposed a delivery plan. Please wait for ${otherPartyName} to respond.`
          : `${otherPartyName} proposed a delivery plan. Please respond to it.`;

      case PlanStatus.REJECTED.value:
        return isMeProposer
          ? `${otherPartyName} rejected your proposal. You may propose another delivery plan.`
          : `You rejected ${otherPartyName}'s proposal. You may propose another delivery plan.`;

      default:
        return isMeProposer
          ? `${otherPartyName} has agreed to your proposal.`
          : `You have agreed to ${otherPartyName}'s proposal.`;
    }
  } else {
    return defaultMessage;
  }
}

function createSenderUpdates({ deliveryUpdate, otherPartyName, method }: CreateMsgParams): string {
  const { status } = deliveryUpdate;
  const deliveryMode = getDeliveryModeLabel(method, true);

  switch (status) {
    case Updates.PREPARING.value:
      return `You are preparing the milk for ${otherPartyName}.`;

    case Updates.ON_THE_WAY.value:
      return `You are on the way to the ${deliveryMode} location.`;

    case Updates.PICKUP_READY.value:
      return `The milk is ready for pickup by ${otherPartyName}.`;

    case Updates.ARRIVED.value:
      return `You have arrived at the ${deliveryMode} location.`;

    case Updates.DELIVERED.value: {
      switch (method) {
        case 'MEETUP':
          return `You have handed over the milk at the meetup location.`;
        case 'PICKUP':
          return `${otherPartyName} has picked up the milk.`;
        case 'DELIVERY':
        default:
          return `You have delivered the milk.`;
      }
    }

    case Updates.COMPLETED.value:
      return MESSAGES.COMPLETION.THANK_YOU(otherPartyName);

    case Updates.DELAYED.value:
      return `You are experiencing a delay. Please inform ${otherPartyName}.`;

    case Updates.CANCELLED.value:
      return `You have cancelled the transaction. You may want to inform ${otherPartyName}.`;

    case Updates.FAILED.value:
      return `You were not able to continue the ${deliveryMode}. You may want to inform ${otherPartyName}.`;

    case Updates.WAITING.value:
    default:
      return `You may now start preparing the milk for ${otherPartyName}.`;
  }
}

function createRecipientUpdates({
  deliveryUpdate,
  otherPartyName,
  method,
}: CreateMsgParams): string {
  const { status } = deliveryUpdate;
  const deliveryMode = getDeliveryModeLabel(method, true);

  switch (status) {
    case Updates.PREPARING.value:
      return `${otherPartyName} is preparing the milk for you.`;

    case Updates.ON_THE_WAY.value:
      return `${otherPartyName} is on the way to the ${deliveryMode} location.`;

    case Updates.PICKUP_READY.value:
      return `The milk is now ready for pickup. You may collect it soon.`;

    case Updates.ARRIVED.value:
      return `${otherPartyName} had arrived at the ${deliveryMode} location.`;

    case Updates.DELIVERED.value: {
      switch (method) {
        case 'MEETUP':
          return `${otherPartyName} has handed over the milk at the meetup location.`;
        case 'PICKUP':
          return `You have picked up the milk. Thank you for collecting it.`;
        case 'DELIVERY':
        default:
          return `${otherPartyName} has delivered the milk at the location.`;
      }
    }

    case Updates.COMPLETED.value:
      return MESSAGES.COMPLETION.SUCCESS;

    case Updates.DELAYED.value:
      return `${otherPartyName} is experiencing a delay. Please check in with them for updates.`;

    case Updates.CANCELLED.value:
      return `${otherPartyName} has cancelled the transaction. You may want to reach out to them for more details.`;

    case Updates.FAILED.value: {
      return MESSAGES.ISSUES.FAILED(otherPartyName, method);
    }

    case Updates.WAITING.value:
    default:
      return `${otherPartyName} is currently busy. Please wait for their updates.`;
  }
}

function getDeliveryModeLabel(mode: DeliveryMode, lowercase = false): string {
  const label = DELIVERY_OPTIONS[mode]?.label || 'delivery';
  return lowercase ? label.toLowerCase() : label;
}
