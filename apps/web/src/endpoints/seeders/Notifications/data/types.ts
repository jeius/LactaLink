import { NotificationType } from '@lactalink/types';

export const typesData: Omit<
  NotificationType,
  'id' | 'createdAt' | 'updatedAt' | 'category' | 'defaultChannels'
>[] = [
  // === DONATION LIFECYCLE ===
  {
    key: 'DONATION_CREATED',
    name: 'Donation Created',
    description: 'Sent when a new donation is successfully created',
    priority: 'MEDIUM',
    trigger: {
      collection: 'donations',
      event: 'CREATE',
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
        {
          key: 'donorName',
          description: 'Name of the donor',
          type: 'string',
          path: 'donor.displayName',
          required: true,
        },
        {
          key: 'donationId',
          description: 'Unique donation identifier',
          type: 'string',
          path: 'id',
          required: true,
        },
      ],
    },
    active: true,
  },
  {
    key: 'DONATION_MATCHED',
    name: 'Donation Matched',
    description: 'Sent when a donation is matched with a request',
    priority: 'HIGH',
    trigger: {
      collection: 'donations',
      event: 'UPDATE',
      conditions: {
        status: 'PARTIALLY_ALLOCATED',
        remainingVolume: { changed: true },
      },
    },
    template: {
      title: 'Your donation has been matched!',
      message:
        "Great news! Your donation of {{volume}}mL has been matched with {{requesterName}}'s request. Delivery arrangements will be coordinated soon.",
      variables: [
        {
          key: 'volume',
          description: 'Volume of milk donated in mL',
          type: 'number',
          path: 'volume',
          required: true,
        },
        {
          key: 'donorName',
          description: 'Name of the donor',
          type: 'string',
          path: 'donor.displayName',
          required: true,
        },
        {
          key: 'requesterName',
          description: 'Name of the requester',
          type: 'string',
          required: true,
          defaultValue: 'a family',
        },
        {
          key: 'requestId',
          description: 'ID of the matched request',
          type: 'string',
          required: true,
        },
      ],
    },
    active: true,
  },
  {
    key: 'DONATION_FULLY_ALLOCATED',
    name: 'Donation Fully Allocated',
    description: 'Sent when a donation is completely allocated',
    priority: 'HIGH',
    trigger: {
      collection: 'donations',
      event: 'UPDATE',
      conditions: {
        status: 'FULLY_ALLOCATED',
        remainingVolume: 0,
      },
    },
    template: {
      title: 'Your donation has been fully allocated!',
      message:
        'Wonderful! Your entire donation of {{volume}}mL has been allocated to help {{recipientCount}} families in need.',
      variables: [
        {
          key: 'volume',
          description: 'Total volume donated in mL',
          type: 'number',
          path: 'volume',
          required: true,
        },
        {
          key: 'donorName',
          description: 'Name of the donor',
          type: 'string',
          path: 'donor.displayName',
          required: true,
        },
        {
          key: 'recipientCount',
          description: 'Number of families helped',
          type: 'number',
          required: true,
        },
      ],
    },
    active: true,
  },

  // === REQUEST LIFECYCLE ===
  {
    key: 'REQUEST_CREATED',
    name: 'Request Created',
    description: 'Confirmation when a new request is submitted',
    priority: 'MEDIUM',
    trigger: {
      collection: 'requests',
      event: 'CREATE',
    },
    template: {
      title: 'Your milk request has been submitted',
      message:
        "Your request for {{volumeNeeded}}mL of breast milk has been received. We'll notify you when a matching donation becomes available.",
      variables: [
        {
          key: 'volumeNeeded',
          description: 'Volume needed in mL',
          type: 'number',
          path: 'volumeNeeded',
          required: true,
        },
        {
          key: 'requesterName',
          description: 'Name of the requester',
          type: 'string',
          path: 'requester.displayName',
          required: true,
        },
        {
          key: 'urgency',
          description: 'Urgency level of the request',
          type: 'string',
          path: 'details.urgency',
          required: true,
        },
        {
          key: 'neededAt',
          description: 'Date when milk is needed',
          type: 'date',
          path: 'details.neededAt',
          required: false,
        },
      ],
    },
    active: true,
  },
  {
    key: 'REQUEST_MATCHED',
    name: 'Request Matched',
    description: 'Sent when a request is matched with a donation',
    priority: 'HIGH',
    trigger: {
      collection: 'requests',
      event: 'UPDATE',
      conditions: {
        status: 'MATCHED',
        matchedDonation: { changed: true },
      },
    },
    template: {
      title: 'Great news! Your request has been matched',
      message:
        'Your request for {{volumeNeeded}}mL has been matched with a donation from {{donorName}}. Delivery details will be coordinated shortly.',
      variables: [
        {
          key: 'volumeNeeded',
          description: 'Volume needed in mL',
          type: 'number',
          path: 'volumeNeeded',
          required: true,
        },
        {
          key: 'donorName',
          description: 'Name of the donor',
          type: 'string',
          path: 'matchedDonation.donor.displayName',
          defaultValue: 'a generous donor',
          required: true,
        },
        {
          key: 'requesterName',
          description: 'Name of the requester',
          type: 'string',
          path: 'requester.displayName',
          required: true,
        },
      ],
    },
    active: true,
  },

  // === DELIVERY UPDATES ===
  {
    key: 'DELIVERY_SCHEDULED',
    name: 'Delivery Scheduled',
    description: 'Sent when a delivery is scheduled',
    priority: 'HIGH',
    trigger: {
      collection: 'deliveries',
      event: 'CREATE',
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
