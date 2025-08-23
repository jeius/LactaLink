import {
  DONATION_REQUEST_STATUS,
  NOTIFICATION_TRIGGER_COLLECTION_OPTIONS,
  NOTIFICATION_TRIGGER_EVENT_OPTIONS,
  PRIORITY_LEVELS,
} from '@lactalink/enums';
import { NotificationType } from '@lactalink/types';

const TRIGGER_EVENT = NOTIFICATION_TRIGGER_EVENT_OPTIONS;
const TRIGGER_COLLECTION = NOTIFICATION_TRIGGER_COLLECTION_OPTIONS;

export const typesData: Omit<
  NotificationType,
  'id' | 'createdAt' | 'updatedAt' | 'category' | 'defaultChannels'
>[] = [
  // #region DONATION
  {
    key: 'DONATION_CREATE',
    name: 'Donation Created',
    description: 'Sent when a new donation is successfully created',
    priority: PRIORITY_LEVELS.LOW.value,
    active: true,
    trigger: {
      collection: TRIGGER_COLLECTION.DONATIONS.value,
      event: TRIGGER_EVENT.CREATE.value,
      conditions: {
        recipient: { exists: false },
      },
    },
    template: {
      title: 'Thank you for your donation!',
      message:
        'Your donation of {{volume}}mL has been successfully registered and is now available to help babies in need.',
      variables: [
        {
          key: 'volume',
          description: 'Volume of milk donated in mL',
          type: 'number',
          path: 'volume',
          required: true,
        },
      ],
    },
  },
  {
    key: 'DONATION_DIRECT',
    name: 'Direct Donation',
    description: 'Sent when a direct donation to a recipient was made.',
    priority: PRIORITY_LEVELS.LOW.value,
    active: true,
    trigger: {
      collection: TRIGGER_COLLECTION.DONATIONS.value,
      event: TRIGGER_EVENT.CREATE.value,
      conditions: {
        recipient: { exists: true },
      },
    },
    template: {
      title: 'Thank you for your donation!',
      message: '{{recipientName}} will be notified of your {{volume}}mL donation.',
      variables: [
        {
          key: 'volume',
          description: 'Volume of milk donated in mL',
          type: 'number',
          path: 'volume',
          required: true,
        },
        {
          key: 'recipientName',
          description: 'Name of the recipient',
          type: 'string',
          required: true,
          path: 'recipient.displayName',
          defaultValue: 'The recipient',
        },
      ],
    },
  },
  {
    key: 'DONATION_EXPIRED',
    name: 'Donation Expired',
    description: 'Sent when a donation expires without being matched',
    priority: PRIORITY_LEVELS.LOW.value,
    active: true,
    trigger: {
      collection: TRIGGER_COLLECTION.DONATIONS.value,
      event: TRIGGER_EVENT.UPDATE.value,
      conditions: {
        status: DONATION_REQUEST_STATUS.EXPIRED.value,
      },
    },
    template: {
      title: 'Your donation has expired',
      message:
        'Unfortunately, your donation of {{volume}}mL has expired without being matched. Thank you for your willingness to help.',
      variables: [
        {
          key: 'volume',
          description: 'Volume of milk donated in mL',
          type: 'number',
          path: 'volume',
          required: true,
        },
      ],
    },
  },
  {
    key: 'DONATION_ACCEPTED',
    name: 'Donation Accepted',
    description: 'Sent when a donation is accepted by the recipient',
    priority: PRIORITY_LEVELS.HIGH.value,
    active: true,
    trigger: {
      collection: TRIGGER_COLLECTION.DONATIONS.value,
      event: TRIGGER_EVENT.UPDATE.value,
      conditions: {
        status: DONATION_REQUEST_STATUS.MATCHED.value,
        recipient: { exists: true },
      },
    },
    template: {
      title: 'Your donation has been accepted!',
      message:
        'Great news! Your donation of {{volume}}mL has been accepted by {{recipientName}}. Delivery arrangements will be coordinated soon.',
      variables: [
        {
          key: 'volume',
          description: 'Volume of milk donated in mL',
          type: 'number',
          path: 'volume',
          required: true,
        },
        {
          key: 'recipientName',
          description: 'Name of the recipient',
          type: 'string',
          required: true,
          path: 'recipient.displayName',
          defaultValue: 'the recipient',
        },
      ],
    },
  },
  {
    key: 'DONATION_REJECTED',
    name: 'Donation Rejected',
    description: 'Sent when a donation is rejected by the recipient',
    priority: PRIORITY_LEVELS.HIGH.value,
    active: true,
    trigger: {
      collection: TRIGGER_COLLECTION.DONATIONS.value,
      event: TRIGGER_EVENT.UPDATE.value,
      conditions: {
        status: DONATION_REQUEST_STATUS.REJECTED.value,
        recipient: { exists: true },
      },
    },
    template: {
      title: 'Your donation has been rejected!',
      message:
        'Unfortunately, your donation of {{volume}}mL has been rejected by {{recipientName}}.',
      variables: [
        {
          key: 'volume',
          description: 'Volume of milk donated in mL',
          type: 'number',
          path: 'volume',
          required: true,
        },
        {
          key: 'recipientName',
          description: 'Name of the recipient',
          type: 'string',
          required: true,
          path: 'recipient.displayName',
          defaultValue: 'the recipient',
        },
      ],
    },
  },
  {
    key: 'MATCHED_DONATION',
    name: 'Donation Matched',
    description: 'Sent when a donation is matched with a request',
    priority: PRIORITY_LEVELS.HIGH.value,
    active: true,
    trigger: {
      collection: TRIGGER_COLLECTION.DONATIONS.value,
      event: TRIGGER_EVENT.UPDATE.value,
      conditions: {
        status: DONATION_REQUEST_STATUS.MATCHED.value,
        recipient: { exists: false },
        remainingVolume: 0,
      },
    },
    template: {
      title: 'Your donation has been requested!',
      message:
        'Great news! Your donation of {{volume}}mL has been requested. Delivery arrangements will be coordinated soon.',
      variables: [
        {
          key: 'volume',
          description: 'Volume of milk donated in mL',
          type: 'number',
          path: 'volume',
          required: true,
        },
      ],
    },
  },
  {
    key: 'MATCHED_DONATION_PARTIALLY',
    name: 'Donation Partially Allocated',
    description: 'Sent when a donation is partially allocated to a request',
    priority: PRIORITY_LEVELS.HIGH.value,
    active: true,
    trigger: {
      collection: TRIGGER_COLLECTION.DONATIONS.value,
      event: TRIGGER_EVENT.UPDATE.value,
      conditions: {
        status: DONATION_REQUEST_STATUS.MATCHED.value,
        recipient: { exists: false },
        remainingVolume: { changed: true },
      },
    },
    template: {
      title: 'Your donation has been partially requested!',
      message:
        'Good news! Part of your {{volume}}mL donation has been requested. Remaining volume is {{remainingVolume}}mL.',
      variables: [
        {
          key: 'volume',
          description: 'Total volume donated in mL',
          type: 'number',
          path: 'volume',
          required: true,
        },
        {
          key: 'remainingVolume',
          description: 'Remaining volume available for requests in mL',
          type: 'number',
          path: 'remainingVolume',
          required: true,
        },
      ],
    },
  },
  // #endregion DONATION

  // #region REQUEST
  {
    key: 'REQUEST_CREATED',
    name: 'Request Created',
    description: 'Confirmation when a new request is submitted',
    priority: PRIORITY_LEVELS.LOW.value,
    active: true,
    trigger: {
      collection: TRIGGER_COLLECTION.REQUESTS.value,
      event: TRIGGER_EVENT.CREATE.value,
      conditions: {
        recipient: { exists: false },
      },
    },
    template: {
      title: 'Your milk request has been submitted',
      message:
        "Your request for {{volumeNeeded}}mL of breast milk has been received. We'll notify you when it gets fulfilled.",
      variables: [
        {
          key: 'volumeNeeded',
          description: 'Volume needed in mL',
          type: 'number',
          path: 'volumeNeeded',
          required: true,
        },
      ],
    },
  },
  {
    key: 'REQUEST_DIRECT',
    name: 'Direct Request',
    description: 'Sent when a direct request to a donor was made.',
    priority: PRIORITY_LEVELS.LOW.value,
    active: true,
    trigger: {
      collection: TRIGGER_COLLECTION.REQUESTS.value,
      event: TRIGGER_EVENT.CREATE.value,
      conditions: {
        recipient: { exists: true },
      },
    },
    template: {
      title: 'Your milk request has been submitted',
      message: '{{recipientName}} will be notified of your {{volumeNeeded}}mL milk request.',
      variables: [
        {
          key: 'volumeNeeded',
          description: 'Volume needed in mL',
          type: 'number',
          path: 'volumeNeeded',
          required: true,
        },
        {
          key: 'recipientName',
          description: 'Name of the recipient of this request.',
          type: 'string',
          required: true,
          path: 'recipient.displayName',
          defaultValue: 'The recipient',
        },
      ],
    },
  },
  {
    key: 'REQUEST_EXPIRED',
    name: 'Request Expired',
    description: 'Sent when a request expires without being fulfilled.',
    priority: PRIORITY_LEVELS.LOW.value,
    active: true,
    trigger: {
      collection: TRIGGER_COLLECTION.REQUESTS.value,
      event: TRIGGER_EVENT.UPDATE.value,
      conditions: {
        status: DONATION_REQUEST_STATUS.EXPIRED.value,
      },
    },
    template: {
      title: 'Your milk request has expired',
      message:
        'Unfortunately, your request for {{volumeNeeded}}mL has expired without being fulfilled.',
      variables: [
        {
          key: 'volumeNeeded',
          description: 'Volume needed in mL',
          type: 'number',
          path: 'volumeNeeded',
          required: true,
        },
      ],
    },
  },
  {
    key: 'REQUEST_ACCEPTED',
    name: 'Request Accepted',
    description: 'Sent when a request is accepted by a donor or organization.',
    priority: PRIORITY_LEVELS.HIGH.value,
    active: true,
    trigger: {
      collection: TRIGGER_COLLECTION.REQUESTS.value,
      event: TRIGGER_EVENT.UPDATE.value,
      conditions: {
        status: DONATION_REQUEST_STATUS.MATCHED.value,
        recipient: { exists: true },
      },
    },
    template: {
      title: 'Your milk request has been accepted!',
      message:
        'Great news! Your request for {{volumeNeeded}}mL has been accepted by {{recipientName}}.',
      variables: [
        {
          key: 'volumeNeeded',
          description: 'Volume needed in mL',
          type: 'number',
          path: 'volumeNeeded',
          required: true,
        },
        {
          key: 'recipientName',
          description: 'Name of the recipient of this request.',
          type: 'string',
          required: true,
          path: 'recipient.displayName',
          defaultValue: 'The recipient',
        },
      ],
    },
  },
  {
    key: 'REQUEST_REJECTED',
    name: 'Request Rejected',
    description: 'Sent when a request is rejected by a donor or organization.',
    priority: PRIORITY_LEVELS.HIGH.value,
    active: true,
    trigger: {
      collection: TRIGGER_COLLECTION.REQUESTS.value,
      event: TRIGGER_EVENT.UPDATE.value,
      conditions: {
        status: DONATION_REQUEST_STATUS.REJECTED.value,
        recipient: { exists: true },
      },
    },
    template: {
      title: 'Your milk request has been rejected',
      message:
        'Unfortunately, your request for {{volumeNeeded}}mL has been rejected by {{recipientName}}.',
      variables: [
        {
          key: 'volumeNeeded',
          description: 'Volume needed in mL',
          type: 'number',
          path: 'volumeNeeded',
          required: true,
        },
        {
          key: 'recipientName',
          description: 'Name of the recipient of this request.',
          type: 'string',
          required: true,
          path: 'recipient.displayName',
          defaultValue: 'The recipient',
        },
      ],
    },
  },
  {
    key: 'MATCHED_REQUEST',
    name: 'Request Matched',
    description: 'Sent when a request is matched with a donation',
    priority: PRIORITY_LEVELS.HIGH.value,
    active: true,
    trigger: {
      collection: TRIGGER_COLLECTION.REQUESTS.value,
      event: TRIGGER_EVENT.UPDATE.value,
      conditions: {
        status: DONATION_REQUEST_STATUS.MATCHED.value,
        recipient: { exists: false },
        volumeNeeded: 0,
      },
    },
    template: {
      title: 'Great news! Someone wants to donate milk to you!',
      message: 'A generous donor wants to fulfill your {{volumeNeeded}}mL milk request.',
      variables: [
        {
          key: 'volumeNeeded',
          description: 'Volume needed in mL',
          type: 'number',
          path: 'volumeNeeded',
          required: true,
        },
      ],
    },
  },
  {
    key: 'MATCHED_REQUEST_PARTIALLY',
    name: 'Request Partially Fulfilled',
    description: 'Sent when a request is partially fulfilled with a donation',
    priority: PRIORITY_LEVELS.HIGH.value,
    active: true,
    trigger: {
      collection: TRIGGER_COLLECTION.REQUESTS.value,
      event: TRIGGER_EVENT.UPDATE.value,
      conditions: {
        status: DONATION_REQUEST_STATUS.MATCHED.value,
        recipient: { exists: false },
        volumeNeeded: { changed: true },
      },
    },
    template: {
      title: 'Great news! Someone wants to donate milk to you!',
      message: 'A generous donor wants to partially fulfill your {{volumeNeeded}}mL milk request.',
      variables: [
        {
          key: 'volumeNeeded',
          description: 'Volume needed in mL',
          type: 'number',
          path: 'volumeNeeded',
          required: true,
        },
      ],
    },
  },
  // #endregion REQUEST

  // === DELIVERY UPDATES ===
  {
    key: 'TRANSACTION_CREATED',
    name: 'Transaction Created',
    description: 'Sent when a new transaction is created.',
    priority: PRIORITY_LEVELS.HIGH.value,
    trigger: {
      collection: TRIGGER_COLLECTION.TRANSACTIONS.value,
      event: TRIGGER_EVENT.CREATE.value,
      conditions: {},
    },
    template: {
      title: 'Delivery scheduled',
      message: 'Your {{deliveryMode}} has been scheduled for {{deliveryDate}}.',
      variables: [
        {
          key: 'deliveryMode',
          description: 'Mode of delivery (pickup/delivery/meetup)',
          type: 'string',
          path: 'mode',
          required: true,
        },
        {
          key: 'deliveryDate',
          description: 'Scheduled delivery date',
          type: 'date',
          path: 'details.confirmedTimeSlot.date',
          required: true,
        },
        {
          key: 'deliveryTime',
          description: 'Scheduled delivery time',
          type: 'string',
          path: 'details.confirmedTimeSlot.timeSlot',
          required: true,
        },
        {
          key: 'recipientName',
          description: 'Name of recipient',
          type: 'string',
          path: 'request.requester.displayName',
          required: true,
        },
        {
          key: 'volume',
          description: 'Volume being delivered in mL',
          type: 'number',
          path: 'request.volumeNeeded',
          required: true,
        },
      ],
    },
    active: true,
  },
  {
    key: 'DELIVERY_COMPLETED',
    name: 'Delivery Completed',
    description: 'Sent when delivery is successfully completed',
    priority: 'MEDIUM',
    trigger: {
      collection: 'deliveries',
      event: 'UPDATE',
    },
    template: {
      title: 'Delivery completed successfully!',
      message:
        'Your milk {{deliveryMode}} has been completed successfully. Thank you for being part of the LactaLink community!',
      variables: [
        {
          key: 'deliveryMode',
          description: 'Type of delivery completed',
          type: 'string',
          path: 'mode',
          required: true,
        },
        {
          key: 'recipientName',
          description: 'Name of recipient',
          type: 'string',
          path: 'request.requester.displayName',
          required: true,
        },
        {
          key: 'volume',
          description: 'Volume delivered',
          type: 'number',
          path: 'request.volumeNeeded',
          required: true,
        },
        {
          key: 'deliveredAt',
          description: 'Date delivery was completed',
          type: 'date',
          path: 'tracking.deliveredAt',
          required: true,
        },
      ],
    },
    active: true,
  },
];
