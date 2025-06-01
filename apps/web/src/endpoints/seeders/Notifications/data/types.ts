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
    triggers: {
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
          required: true,
        },
        { key: 'donorName', description: 'Name of the donor', type: 'string', required: true },
        {
          key: 'donationId',
          description: 'Unique donation identifier',
          type: 'string',
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
    triggers: {
      collection: 'donations',
      event: 'UPDATE',
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
          required: true,
        },
        { key: 'donorName', description: 'Name of the donor', type: 'string', required: true },
        {
          key: 'requesterName',
          description: 'Name of the requester',
          type: 'string',
          required: true,
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
    triggers: {
      collection: 'donations',
      event: 'UPDATE',
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
          required: true,
        },
        { key: 'donorName', description: 'Name of the donor', type: 'string', required: true },
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
    triggers: {
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
          required: true,
        },
        {
          key: 'requesterName',
          description: 'Name of the requester',
          type: 'string',
          required: true,
        },
        {
          key: 'urgency',
          description: 'Urgency level of the request',
          type: 'string',
          required: true,
        },
        {
          key: 'neededBy',
          description: 'Date when milk is needed',
          type: 'date',
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
    triggers: {
      collection: 'requests',
      event: 'UPDATE',
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
          required: true,
        },
        { key: 'donorName', description: 'Name of the donor', type: 'string', required: true },
        {
          key: 'requesterName',
          description: 'Name of the requester',
          type: 'string',
          required: true,
        },
        {
          key: 'matchedVolume',
          description: 'Volume matched in mL',
          type: 'number',
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
    triggers: {
      collection: 'deliveries',
      event: 'CREATE',
    },
    template: {
      title: 'Delivery scheduled',
      message: 'Your {{deliveryType}} has been scheduled for {{deliveryDate}} at {{deliveryTime}}.',
      variables: [
        {
          key: 'deliveryType',
          description: 'Type of delivery (pickup/delivery/meetup)',
          type: 'string',
          required: true,
        },
        {
          key: 'deliveryDate',
          description: 'Scheduled delivery date',
          type: 'date',
          required: true,
        },
        {
          key: 'deliveryTime',
          description: 'Scheduled delivery time',
          type: 'string',
          required: true,
        },
        {
          key: 'recipientName',
          description: 'Name of recipient',
          type: 'string',
          required: true,
        },
        {
          key: 'volume',
          description: 'Volume being delivered in mL',
          type: 'number',
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
    triggers: {
      collection: 'deliveries',
      event: 'UPDATE',
    },
    template: {
      title: 'Delivery completed successfully!',
      message:
        'Your milk {{deliveryType}} has been completed successfully. Thank you for being part of the LactaLink community!',
      variables: [
        {
          key: 'deliveryType',
          description: 'Type of delivery completed',
          type: 'string',
          required: true,
        },
        {
          key: 'recipientName',
          description: 'Name of recipient',
          type: 'string',
          required: true,
        },
        { key: 'volume', description: 'Volume delivered', type: 'number', required: true },
        {
          key: 'completionDate',
          description: 'Date delivery was completed',
          type: 'date',
          required: true,
        },
      ],
    },
    active: true,
  },
];
