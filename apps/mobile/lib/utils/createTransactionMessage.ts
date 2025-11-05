import { DELIVERY_OPTIONS } from '@lactalink/enums';
import { Delivery, Transaction, User } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractName, extractTransactionData } from '@lactalink/utilities/extractors';
import { getMeUser } from '../stores/meUserStore';

type UserRole = 'sender' | 'recipient' | 'other';
type DeliveryMode = 'MEETUP' | 'DELIVERY' | 'PICKUP';
type ExtractedTransactionData = NonNullable<ReturnType<typeof extractTransactionData>>;

interface TransactionMessageParams {
  otherPartyProfile: User['profile'];
  transaction?: Transaction;
}

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
  },
} as const;

export function createTransactionMessage(params: TransactionMessageParams): string {
  const { otherPartyProfile, transaction } = params;
  const meUserProfile = getMeUser()?.profile;
  const data = extractTransactionData(transaction);

  if (!data) {
    return getDefaultMessage(otherPartyProfile);
  }

  const userRole = getUserRole(meUserProfile, data);
  const otherPartyName = getOtherPartyName(otherPartyProfile);

  switch (data.status.value) {
    case 'PENDING_DELIVERY_CONFIRMATION':
      return handlePendingDeliveryConfirmation(data, otherPartyName, userRole);

    case 'DELIVERY_SCHEDULED':
      return handleDeliveryScheduled(data, otherPartyName, userRole);

    case 'MATCHED':
      return handleMatched(data, otherPartyName, userRole);

    case 'IN_TRANSIT':
      return handleInTransit(data, otherPartyName, userRole, transaction);

    case 'READY_FOR_PICKUP':
      return handleReadyForPickup(otherPartyName, userRole);

    case 'DELIVERED':
      return handleDelivered(data, otherPartyName, userRole);

    case 'COMPLETED':
      return MESSAGES.COMPLETION.SUCCESS;

    case 'CANCELLED':
      return MESSAGES.ISSUES.CANCELLED(otherPartyName);

    case 'FAILED':
      return MESSAGES.ISSUES.FAILED(otherPartyName);

    default:
      return getDefaultMessage(otherPartyProfile);
  }
}

// Helper functions
function getUserRole(meUserProfile: User['profile'], data: ExtractedTransactionData): UserRole {
  if (isEqualProfiles(meUserProfile, data.sender)) return 'sender';
  if (isEqualProfiles(meUserProfile, data.recipient)) return 'recipient';
  return 'other';
}

function getOtherPartyName(otherPartyProfile: User['profile']): string {
  return extractName({ profile: otherPartyProfile }) || 'The other user';
}

function getDefaultMessage(otherPartyProfile: User['profile']): string {
  const otherPartyName = getOtherPartyName(otherPartyProfile);
  return `Transaction with ${otherPartyName}.`;
}

function getDeliveryModeLabel(mode: DeliveryMode, lowercase = false): string {
  const label = DELIVERY_OPTIONS[mode]?.label || 'delivery';
  return lowercase ? label.toLowerCase() : label;
}

function handlePendingDeliveryConfirmation(
  data: ExtractedTransactionData,
  otherPartyName: string,
  userRole: UserRole
): string {
  if (!data.proposed) {
    return `${otherPartyName} has not proposed a transaction method yet. You may want to suggest one.`;
  }

  const { agreements, mode } = data.proposed;
  const proposedMode = getDeliveryModeLabel(mode, true);

  const userAgreement = userRole === 'sender' ? agreements?.sender : agreements?.recipient;

  if (userAgreement && !userAgreement.agreed) {
    return `${otherPartyName} has been waiting for you to respond on the proposed ${proposedMode} details.`;
  }

  return `You have rejected the proposed ${proposedMode} details of ${otherPartyName}.`;
}

function handleDeliveryScheduled(
  data: ExtractedTransactionData,
  otherPartyName: string,
  userRole: UserRole
): string {
  if (!data.delivery) return MESSAGES.NO_DELIVERY;

  const mode = getDeliveryModeLabel(data.delivery.mode);
  const baseMessage = `${mode} date and location have been confirmed.`;

  switch (userRole) {
    case 'sender':
      return `${baseMessage} ${MESSAGES.MILK_PREPARATION.SENDER}`;
    case 'recipient':
      return `${baseMessage} ${MESSAGES.MILK_PREPARATION.RECIPIENT(otherPartyName)}`;
    default:
      return baseMessage;
  }
}

function handleMatched(
  data: ExtractedTransactionData,
  otherPartyName: string,
  userRole: UserRole
): string {
  if (!data.delivery) return MESSAGES.NO_DELIVERY;

  const mode = getDeliveryModeLabel(data.delivery.mode, true);

  switch (userRole) {
    case 'sender':
      return `${otherPartyName} is patiently waiting for you in preparing the milk.`;
    case 'recipient':
      return `${otherPartyName} is currently preparing the milk. Please wait for it to be ready.`;
    default:
      return `The milk is currently being prepared for ${mode}.`;
  }
}

function handleInTransit(
  data: ExtractedTransactionData,
  otherPartyName: string,
  userRole: UserRole,
  transaction?: Transaction
): string {
  if (!data.delivery) return MESSAGES.NO_DELIVERY;

  const deliveryMode = data.delivery.mode as DeliveryMode;
  const arrivalState = transaction?.delivery?.arrival;

  switch (deliveryMode) {
    case 'MEETUP':
      return handleMeetupInTransit(arrivalState, otherPartyName, userRole);
    case 'DELIVERY':
      return handleDeliveryInTransit(otherPartyName, userRole);
    default:
      return 'The milk is on the way to the confirmed location.';
  }
}

function handleMeetupInTransit(
  arrivalState: Delivery['arrival'],
  otherPartyName: string,
  userRole: UserRole
): string {
  const senderDeparted = !!arrivalState?.senderDepartedAt;
  const recipientDeparted = !!arrivalState?.recipientDepartedAt;

  const otherPartyDeparted = userRole === 'sender' ? recipientDeparted : senderDeparted;

  if (otherPartyDeparted) {
    return `${otherPartyName} have departed for the meetup. ${MESSAGES.SAFETY.STAY_SAFE}`;
  }

  return `${otherPartyName} did not depart for the meetup yet. You may want to check in with them.`;
}

function handleDeliveryInTransit(otherPartyName: string, userRole: UserRole): string {
  switch (userRole) {
    case 'sender':
      return `Please stay safe on the way. ${MESSAGES.SAFETY.CHECK_IN(otherPartyName)}`;
    case 'recipient':
      return `${otherPartyName} is on the way to the delivery location. Please be prepared to receive it.`;
    default:
      return 'The milk is on the way to the confirmed location.';
  }
}

function handleReadyForPickup(otherPartyName: string, userRole: UserRole): string {
  switch (userRole) {
    case 'sender':
      return `${otherPartyName} is on the way to pick up the milk. Please be prepared to hand it over.`;
    case 'recipient':
      return `Please stay safe on the way to pick up the milk from ${otherPartyName}.`;
    default:
      return 'The milk is being picked up by the recipient.';
  }
}

function handleDelivered(
  data: ExtractedTransactionData,
  otherPartyName: string,
  userRole: UserRole
): string {
  if (!data.delivery) return MESSAGES.NO_DELIVERY;

  const deliveryMode = data.delivery.mode as DeliveryMode;

  switch (deliveryMode) {
    case 'MEETUP':
      return 'The milk has been handed over at the meetup location.';
    case 'DELIVERY':
      return 'The milk has been delivered to the confirmed location.';
    case 'PICKUP':
      return userRole === 'sender'
        ? `${otherPartyName} has picked up the milk. ${MESSAGES.COMPLETION.THANK_YOU}`
        : 'The milk has been picked up at the confirmed location.';
    default:
      return 'The milk has been delivered to the confirmed location.';
  }
}
