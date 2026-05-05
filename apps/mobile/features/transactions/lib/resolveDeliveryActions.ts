import { DELIVERY_OPTIONS, DELIVERY_UPDATES, TRANSACTION_STATUS } from '@lactalink/enums';
import { DeliveryUpdate, Transaction } from '@lactalink/types/payload-generated-types';
import { DeliveryAction } from '../lib/types';

const TXN_READY_FOR_PICKUP = TRANSACTION_STATUS.READY_FOR_PICKUP.value;
const TXN_IN_TRANSIT = TRANSACTION_STATUS.IN_TRANSIT.value;
const TXN_DELIVERED = TRANSACTION_STATUS.DELIVERED.value;

const WAITING = DELIVERY_UPDATES.WAITING.value;
const PREPARING = DELIVERY_UPDATES.PREPARING.value;
const PICKUP_READY = DELIVERY_UPDATES.PICKUP_READY.value;
const ON_THE_WAY = DELIVERY_UPDATES.ON_THE_WAY.value;
const ARRIVED = DELIVERY_UPDATES.ARRIVED.value;
const DELIVERED = DELIVERY_UPDATES.DELIVERED.value;
const COMPLETED = DELIVERY_UPDATES.COMPLETED.value;
const DELAYED = DELIVERY_UPDATES.DELAYED.value;

const PICKUP = DELIVERY_OPTIONS.PICKUP.value;
const DELIVERY_MODE = DELIVERY_OPTIONS.DELIVERY.value;
const MEETUP = DELIVERY_OPTIONS.MEETUP.value;

/**
 * Returns the ordered list of next valid delivery update statuses for the given role,
 * mode, and current update status. Only statuses that represent a forward progression
 * are returned.
 *
 * @param myUpdateStatus - The current user's delivery update status (or `null` if none)
 * @param txnStatus - The current transaction status
 * @param isSender - Whether the current user is the sender (donor)
 * @param mode - The accepted delivery method
 * @returns Array of available {@link DeliveryAction}s (may be empty)
 */
export function resolveDeliveryActions(
  myUpdateStatus: DeliveryUpdate['status'] | null,
  txnStatus: Transaction['status'],
  isSender: boolean,
  mode: string
): DeliveryAction[] {
  const current = myUpdateStatus ?? WAITING;

  if (isSender) {
    if (mode === PICKUP) {
      // Donor PICKUP flow: WAITING → PREPARING → PICKUP_READY → (done)
      switch (current) {
        case WAITING:
          return [{ label: 'Start Preparing', status: PREPARING, action: 'primary' }];
        case PREPARING:
          return [{ label: 'Ready for Pickup', status: PICKUP_READY, action: 'primary' }];
        default:
          return [];
      }
    }

    if (mode === DELIVERY_MODE || mode === MEETUP) {
      // Donor DELIVERY/MEETUP flow: WAITING → PREPARING → ON_THE_WAY → ARRIVED → DELIVERED → (wait)
      switch (current) {
        case WAITING:
          return [{ label: 'Start Preparing', status: PREPARING, action: 'primary' }];
        case PREPARING:
          return [{ label: "I'm On My Way", status: ON_THE_WAY, action: 'primary' }];
        case ON_THE_WAY:
          return [
            { label: "I've Arrived", status: ARRIVED, action: 'primary' },
            { label: 'Experiencing Delay', status: DELAYED, action: 'secondary' },
          ];
        case ARRIVED:
          return [
            {
              label: mode === MEETUP ? "I've Handed Over" : "I've Delivered",
              status: DELIVERED,
              action: 'primary',
            },
          ];
        case DELAYED:
          return [{ label: 'Back On Track', status: ON_THE_WAY, action: 'primary' }];
        default:
          return [];
      }
    }
  }

  // Recipient flows
  if (!isSender) {
    if (mode === PICKUP) {
      // Recipient PICKUP flow: wait for READY_FOR_PICKUP → ON_THE_WAY → ARRIVED → DELIVERED
      if (txnStatus !== TXN_READY_FOR_PICKUP && current === WAITING) return [];
      switch (current) {
        case WAITING:
          return [{ label: "I'm On My Way", status: ON_THE_WAY, action: 'primary' }];
        case ON_THE_WAY:
          return [
            { label: "I've Arrived", status: ARRIVED, action: 'primary' },
            { label: 'Experiencing Delay', status: DELAYED, action: 'secondary' },
          ];
        case ARRIVED:
          return [{ label: "I've Picked Up the Milk", status: DELIVERED, action: 'primary' }];
        case DELAYED:
          return [{ label: 'Back On Track', status: ON_THE_WAY, action: 'primary' }];
        default:
          return [];
      }
    }

    if (mode === DELIVERY_MODE) {
      // Recipient DELIVERY flow: wait for IN_TRANSIT → passive → DELIVERED txn → "Milk Received"
      if (txnStatus === TXN_DELIVERED && current !== COMPLETED) {
        return [{ label: 'Milk Received', status: COMPLETED, action: 'primary' }];
      }
      return [];
    }

    if (mode === MEETUP) {
      // Recipient MEETUP flow: triggered when IN_TRANSIT → ON_THE_WAY → ARRIVED → (wait for donor DELIVERED) → COMPLETED
      if (txnStatus !== TXN_IN_TRANSIT && current === WAITING) return [];
      switch (current) {
        case WAITING:
          return [{ label: "I'm On My Way", status: ON_THE_WAY, action: 'primary' }];
        case ON_THE_WAY:
          return [
            { label: "I've Arrived", status: ARRIVED, action: 'primary' },
            { label: 'Experiencing Delay', status: DELAYED, action: 'secondary' },
          ];
        case DELAYED:
          return [{ label: 'Back On Track', status: ON_THE_WAY, action: 'primary' }];
        case ARRIVED:
          // Wait for donor to mark DELIVERED — unlock Milk Received when txn status becomes DELIVERED
          if (txnStatus === TXN_DELIVERED) {
            return [{ label: 'Milk Received', status: COMPLETED, action: 'primary' }];
          }
          return [];
        default:
          return [];
      }
    }
  }

  return [];
}
