import {
  DONATION_REQUEST_STATUS,
  NOTIFICATION_TRIGGER_COLLECTION_OPTIONS,
  NOTIFICATION_TRIGGER_EVENT_OPTIONS,
  PRIORITY_LEVELS,
} from '@lactalink/enums';
import { NotificationType } from '@lactalink/types';
import { Operator } from 'payload';
import { validOperatorSet } from 'payload/shared';

const TRIGGER_EVENT = NOTIFICATION_TRIGGER_EVENT_OPTIONS;
const TRIGGER_COLLECTION = NOTIFICATION_TRIGGER_COLLECTION_OPTIONS;

type ExtendedOperator = Operator | 'changed';
const operators = new Map<ExtendedOperator, ExtendedOperator>(validOperatorSet.entries());
operators.set('changed', 'changed');

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
        recipient: { [operators.get('exists')!]: false },
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
        and: [
          { status: { [operators.get('equals')!]: DONATION_REQUEST_STATUS.PENDING.value } },
          { recipient: { [operators.get('exists')!]: true } },
        ],
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
          path: 'recipient.value.displayName',
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
        and: [
          { status: { [operators.get('equals')!]: DONATION_REQUEST_STATUS.EXPIRED.value } },
          { status: { [operators.get('changed')!]: true } },
        ],
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
        and: [
          { status: { [operators.get('equals')!]: DONATION_REQUEST_STATUS.MATCHED.value } },
          { status: { [operators.get('changed')!]: true } },
          { recipient: { [operators.get('exists')!]: true } },
          { recipient: { [operators.get('changed')!]: false } },
        ],
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
          path: 'recipient.value.displayName',
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
        and: [
          { status: { [operators.get('equals')!]: DONATION_REQUEST_STATUS.REJECTED.value } },
          { status: { [operators.get('changed')!]: true } },
          { recipient: { [operators.get('exists')!]: true } },
          { recipient: { [operators.get('changed')!]: false } },
        ],
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
          path: 'recipient.value.displayName',
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
        and: [
          { status: { [operators.get('equals')!]: DONATION_REQUEST_STATUS.MATCHED.value } },
          { status: { [operators.get('changed')!]: true } },
          { recipient: { [operators.get('exists')!]: false } },
          { recipient: { [operators.get('changed')!]: false } },
          { remainingVolume: { [operators.get('equals')!]: 0 } },
        ],
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
        and: [
          { status: { [operators.get('equals')!]: DONATION_REQUEST_STATUS.MATCHED.value } },
          { recipient: { [operators.get('exists')!]: false } },
          { recipient: { [operators.get('changed')!]: false } },
          { remainingVolume: { [operators.get('greater_than')!]: 0 } },
          { remainingVolume: { [operators.get('changed')!]: true } },
        ],
      },
    },
    template: {
      title: 'Your donation has been partially requested!',
      message:
        'Great news! Part of your {{volume}}mL donation has been requested. Remaining volume is {{remainingVolume}}mL.',
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
  {
    key: 'MATCHED_DONATION_FULLY',
    name: 'Donation Fully Allocated',
    description: 'Sent when a donation is fully allocated to a request',
    priority: PRIORITY_LEVELS.HIGH.value,
    active: true,
    trigger: {
      collection: TRIGGER_COLLECTION.DONATIONS.value,
      event: TRIGGER_EVENT.UPDATE.value,
      conditions: {
        and: [
          { status: { [operators.get('equals')!]: DONATION_REQUEST_STATUS.MATCHED.value } },
          { status: { [operators.get('changed')!]: false } },
          { recipient: { [operators.get('exists')!]: false } },
          { recipient: { [operators.get('changed')!]: false } },
          { remainingVolume: { [operators.get('equals')!]: 0 } },
          { remainingVolume: { [operators.get('changed')!]: true } },
        ],
      },
    },
    template: {
      title: 'Your donation has been fully allocated!',
      message: 'Great news! Your {{volume}}mL donation has been fully allocated.',
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
        recipient: { [operators.get('exists')!]: false },
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
          path: 'initialVolumeNeeded',
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
        and: [
          { status: { [operators.get('equals')!]: DONATION_REQUEST_STATUS.PENDING.value } },
          { recipient: { [operators.get('exists')!]: true } },
        ],
      },
    },
    template: {
      title: 'Your milk request has been sent!',
      message: '{{recipientName}} will be notified of your {{volumeNeeded}}mL milk request.',
      variables: [
        {
          key: 'volumeNeeded',
          description: 'Volume needed in mL',
          type: 'number',
          path: 'initialVolumeNeeded',
          required: true,
        },
        {
          key: 'recipientName',
          description: 'Name of the recipient of this request.',
          type: 'string',
          required: true,
          path: 'recipient.value.displayName',
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
        and: [
          { status: { [operators.get('equals')!]: DONATION_REQUEST_STATUS.EXPIRED.value } },
          { status: { [operators.get('changed')!]: true } },
        ],
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
          path: 'initialVolumeNeeded',
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
        and: [
          { status: { [operators.get('equals')!]: DONATION_REQUEST_STATUS.MATCHED.value } },
          { status: { [operators.get('changed')!]: true } },
          { recipient: { [operators.get('exists')!]: true } },
          { status: { [operators.get('changed')!]: false } },
        ],
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
          path: 'initialVolumeNeeded',
          required: true,
        },
        {
          key: 'recipientName',
          description: 'Name of the recipient of this request.',
          type: 'string',
          required: true,
          path: 'recipient.value.displayName',
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
        and: [
          { status: { [operators.get('equals')!]: DONATION_REQUEST_STATUS.REJECTED.value } },
          { status: { [operators.get('changed')!]: true } },
          { recipient: { [operators.get('exists')!]: true } },
          { recipient: { [operators.get('changed')!]: false } },
        ],
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
          path: 'initialVolumeNeeded',
          required: true,
        },
        {
          key: 'recipientName',
          description: 'Name of the recipient of this request.',
          type: 'string',
          required: true,
          path: 'recipient.value.displayName',
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
        and: [
          { status: { [operators.get('equals')!]: DONATION_REQUEST_STATUS.MATCHED.value } },
          { status: { [operators.get('changed')!]: true } },
          { recipient: { [operators.get('exists')!]: false } },
          { recipient: { [operators.get('changed')!]: false } },
          { volumeNeeded: { [operators.get('equals')!]: 0 } },
        ],
      },
    },
    template: {
      title: 'Someone wants to donate milk to you!',
      message:
        'Great news! A generous donor wants to fulfill your {{volumeNeeded}}mL milk request.',
      variables: [
        {
          key: 'volumeNeeded',
          description: 'Volume needed in mL',
          type: 'number',
          path: 'initialVolumeNeeded',
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
        and: [
          { status: { [operators.get('equals')!]: DONATION_REQUEST_STATUS.MATCHED.value } },
          { recipient: { [operators.get('exists')!]: false } },
          { recipient: { [operators.get('changed')!]: false } },
          { volumeNeeded: { [operators.get('greater_than')!]: 0 } },
          { volumeNeeded: { [operators.get('changed')!]: true } },
        ],
      },
    },
    template: {
      title: 'Someone wants to donate a portion to your milk request!',
      message:
        'Great news! A generous donor wants to partially fulfill your {{volumeNeeded}}mL milk request.',
      variables: [
        {
          key: 'volumeNeeded',
          description: 'Volume needed in mL',
          type: 'number',
          path: 'initialVolumeNeeded',
          required: true,
        },
      ],
    },
  },
  {
    key: 'MATCHED_REQUEST_FULLY',
    name: 'Request Fully Fulfilled',
    description: 'Sent when a request is fully fulfilled with a donation',
    priority: PRIORITY_LEVELS.HIGH.value,
    active: true,
    trigger: {
      collection: TRIGGER_COLLECTION.REQUESTS.value,
      event: TRIGGER_EVENT.UPDATE.value,
      conditions: {
        and: [
          { status: { [operators.get('equals')!]: DONATION_REQUEST_STATUS.MATCHED.value } },
          { status: { [operators.get('changed')!]: false } },
          { recipient: { [operators.get('exists')!]: false } },
          { recipient: { [operators.get('changed')!]: false } },
          { volumeNeeded: { [operators.get('equals')!]: 0 } },
          { volumeNeeded: { [operators.get('changed')!]: true } },
        ],
      },
    },
    template: {
      title: 'Your request has been fully fulfilled!',
      message: 'Great News! Your {{volumeNeeded}}mL milk request has been fully fulfilled.',
      variables: [
        {
          key: 'volumeNeeded',
          description: 'Volume needed in mL',
          type: 'number',
          path: 'initialVolumeNeeded',
          required: true,
        },
      ],
    },
  },
  // #endregion REQUEST
];
