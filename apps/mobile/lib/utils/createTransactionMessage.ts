import { DELIVERY_OPTIONS } from '@lactalink/enums';
import { PopulatedUserProfile } from '@lactalink/types';
import { DeliveryDetail, DeliveryUpdate, User } from '@lactalink/types/payload-generated-types';
import { extractName } from '@lactalink/utilities/extractors';

type DeliveryMode = DeliveryDetail['method'];

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
    SUCCESS: 'The transaction has been completed successfully.',
    THANK_YOU: 'Thank you for your donation!',
  },
  ISSUES: {
    CANCELLED: (name: string) =>
      `The transaction has been cancelled. You may want to reach out to ${name} for more details.`,
    FAILED: (name: string) =>
      `The transaction has failed. You may want to reach out to ${name} for more details.`,
    DELAYED: (name: string) =>
      `${name} is experiencing a delay. Please check in with them for updates.`,
  },
} as const;

export function createTransactionMessage(
  otherParty: PopulatedUserProfile,
  deliveryDetail: DeliveryDetail,
  deliveryUpdate?: DeliveryUpdate | null
): string {
  const otherPartyName = getOtherPartyName(otherParty);
  const defaultMessage = `No updates from ${otherPartyName}.`;

  if (!deliveryUpdate) return defaultMessage;

  const { status } = deliveryUpdate;
  const { method } = deliveryDetail;
  const deliveryMode = getDeliveryModeLabel(method);

  switch (status) {
    case 'WAITING':
      return `${otherPartyName} is waiting for further updates.`;

    case 'PREPARING':
      return `${otherPartyName} is preparing the milk.`;

    case 'ON_THE_WAY':
      return `${otherPartyName} is on the way to the ${deliveryMode} location.`;

    case 'PICKUP_READY':
      return `The milk is ready for pickup.`;

    case 'ARRIVED':
      return `${otherPartyName} has arrived at the ${deliveryMode} location.`;

    case 'DELIVERED':
      return handleDelivered(method, otherPartyName);

    case 'COMPLETED':
      return MESSAGES.COMPLETION.SUCCESS;

    case 'DELAYED':
      return MESSAGES.ISSUES.DELAYED(otherPartyName);

    case 'CANCELLED':
      return MESSAGES.ISSUES.CANCELLED(otherPartyName);

    case 'FAILED':
      return MESSAGES.ISSUES.FAILED(otherPartyName);

    default:
      return defaultMessage;
  }
}

// Helper functions
function getOtherPartyName(otherPartyProfile: User['profile']): string {
  return extractName({ profile: otherPartyProfile }) || 'The other user';
}

function getDeliveryModeLabel(mode: DeliveryMode, lowercase = false): string {
  const label = DELIVERY_OPTIONS[mode]?.label || 'delivery';
  return lowercase ? label.toLowerCase() : label;
}

function handleDelivered(method: DeliveryMode, otherPartyName: string): string {
  switch (method) {
    case 'MEETUP':
      return 'The milk has been handed over at the meetup location.';
    case 'PICKUP':
      return `${otherPartyName} has picked up the milk.`;
    case 'DELIVERY':
    default:
      return 'The milk has been delivered.';
  }
}
