import { isMeProfile } from '@/lib/utils/isMeUser';
import {
  DELIVERY_DETAILS_STATUS,
  DELIVERY_OPTIONS,
  DELIVERY_UPDATES,
  TRANSACTION_STATUS,
} from '@lactalink/enums';
import { DeliveryMode } from '@lactalink/types';
import {
  DeliveryDetail,
  DeliveryUpdate,
  Transaction,
} from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractName } from '@lactalink/utilities/extractors';
import { extractDeliveryDetail, extractDeliveryPlan } from './extractors';
import { getOtherParty, getOtherPartyDeliveryUpdates } from './getOtherParty';

const PlanStatus = DELIVERY_DETAILS_STATUS;
const TxnStatus = TRANSACTION_STATUS;
const Updates = DELIVERY_UPDATES;
const Methods = DELIVERY_OPTIONS;

/**
 * Generates a message describing the other party's delivery updates.
 *
 * Shows the other party's journey and actions in sender and recipient perspectives.
 */
export function createUpdatesMessage(transaction: Transaction): string {
  const confirmedDelivery = extractDeliveryDetail(transaction);
  const deliveryPlan = extractDeliveryPlan(transaction);

  const otherPartyProfile = getOtherParty(transaction);
  const otherPartyName = extractName({ profile: otherPartyProfile });

  const isIndividual = otherPartyProfile.relationTo === 'individuals';
  const isSender = isEqualProfiles(otherPartyProfile, transaction.sender);
  const name =
    otherPartyName || (isIndividual ? (isSender ? 'Donor' : 'Recipient') : 'Organization');
  const defaultMessage = `Feel free to check in with ${name} for updates.`;

  if (transaction.status === TxnStatus.PENDING.value) {
    if (deliveryPlan) {
      return createDeliveryPlanMessage({ deliveryPlan, name });
    }
    return 'It looks like there is no delivery plan proposed yet. You can propose one to get the process started.';
  }

  const deliveryMode = confirmedDelivery?.method;
  const deliveryUpdate = getOtherPartyDeliveryUpdates(transaction);

  return deliveryUpdate && deliveryMode
    ? createOtherPartyUpdatesMessage({
        name,
        deliveryUpdate,
        deliveryMode,
        isSender: isSender,
      })
    : defaultMessage;
}

/**
 * Generates a message of the other party's delivery updates.
 *
 * Shows the other party's journey and actions in sender and recipient perspectives.
 *
 * @param params.name - Name of the other party
 * @param params.deliveryUpdate - Delivery update of the other party
 * @param params.deliveryMode - Mode of the confirmed delivery details
 * @param params.isSender - Set to true if the other party is a sender
 * @returns A string message describing the other party's delivery updates
 */
export function createOtherPartyUpdatesMessage({
  name,
  deliveryUpdate,
  deliveryMode,
  isSender,
}: {
  /** Name of the other party */
  name: string;
  /** Delivery Updates of the other party */
  deliveryUpdate: DeliveryUpdate;
  /** Mode of the confirmed delivery details */
  deliveryMode: DeliveryMode;
  /** Set to true if the other party is a sender*/
  isSender: boolean;
}): string {
  const { status } = deliveryUpdate;

  // Sender specific updates - focuses on the sender's journey and actions
  if (isSender) {
    switch (status) {
      case Updates.WAITING.value:
        return `${name} will prepare the milk soon. Please check in with them for updates.`;
      case Updates.PREPARING.value:
        return `${name} is preparing the milk, making sure it's in good condition for you.`;
      case Updates.PICKUP_READY.value:
        return deliveryMode === 'MEETUP'
          ? `${name} has the milk ready. Head to the meetup location to receive it.`
          : `${name} has the milk ready for pickup. Please head over to collect it.`;
      case Updates.ON_THE_WAY.value:
        return deliveryMode === 'MEETUP'
          ? `${name} is on the way to the meetup location.`
          : `${name} is on the way to deliver the milk.`;
      case Updates.ARRIVED.value:
        return deliveryMode === 'MEETUP'
          ? `${name} has arrived at the meetup location. Please head there to receive the milk.`
          : `${name} has arrived at the ${Methods[deliveryMode].label.toLowerCase()} location`;
      case Updates.DELIVERED.value:
        return deliveryMode === 'MEETUP'
          ? `${name} has handed over the milk. Please confirm you received it.`
          : `${name} has delivered the milk. Please confirm you received it.`;
      case Updates.COMPLETED.value:
        return `The transaction with ${name} has been completed. Thank you for using LactaLink!`;
    }
  }

  switch (status) {
    case Updates.WAITING.value: {
      if (deliveryMode === 'DELIVERY') return `${name} is waiting for you to deliver the milk.`;
      if (deliveryMode === 'PICKUP')
        return `${name} is waiting for the milk to be available for pickup.`;
      return `You may want to check in with ${name} for updates.`;
    }
    case Updates.PREPARING.value: {
      if (deliveryMode === 'MEETUP')
        return `${name} is preparing and will head to the meetup location soon.`;
      if (deliveryMode === 'PICKUP') return `${name} is preparing to pick up the milk soon.`;
      return `${name} is preparing to receive the milk soon.`;
    }
    case Updates.ON_THE_WAY.value:
      return deliveryMode === 'MEETUP'
        ? `${name} is on the way to the meetup location.`
        : `${name} is on the way to pickup the milk.`;
    case Updates.ARRIVED.value:
      return deliveryMode === 'MEETUP'
        ? `${name} has arrived at the meetup location. Please head there to handover the milk.`
        : `${name} has arrived at the ${Methods[deliveryMode].label.toLowerCase()} location`;
    case Updates.DELIVERED.value:
    case Updates.COMPLETED.value:
      return deliveryMode === 'PICKUP'
        ? `${name} has picked-up the milk. Thank you for your contribution!`
        : `${name} has received the milk. Thank you for your contribution!`;
    case Updates.DELAYED.value:
      return `${name} is experiencing a delay. Please check in with them for updates.`;
    case Updates.CANCELLED.value:
      return `${name} has cancelled the transaction.`;
    case Updates.FAILED.value:
      return `${name} was unable to complete the transaction. Please reach out to them for more information.`;
  }

  return `Feel free to check in with ${name} for updates.`;
}

/**
 * Generates a message describing the delivery plan details proposed.
 *
 * @param params.name - Name of the other party
 * @param params.deliveryPlan - The proposed delivery plan details
 * @returns A string message describing the delivery plan details proposed
 */
export function createDeliveryPlanMessage({
  name,
  deliveryPlan,
}: {
  name: string;
  deliveryPlan: DeliveryDetail;
}): string {
  const status = deliveryPlan.status;
  const isMeProposer = isMeProfile(deliveryPlan.proposedBy);

  switch (status) {
    case PlanStatus.PENDING.value:
      return isMeProposer
        ? `You proposed a delivery plan to ${name}. Please wait for them to respond.`
        : `${name} proposed a delivery plan. Please respond to it.`;
    case PlanStatus.REJECTED.value:
      return isMeProposer
        ? `${name} rejected your delivery plan proposal. You may propose another plan.`
        : `You rejected ${name}'s delivery plan proposal. You may propose another plan.`;
    case PlanStatus.ACCEPTED.value:
      return isMeProposer
        ? `${name} has accepted your delivery plan proposal.`
        : `You have accepted ${name}'s delivery plan proposal.`;
  }
}
