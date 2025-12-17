import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import type { TransactionEvent } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import type { Payload, PayloadRequest } from 'payload';
import { CollectionAfterChangeHook } from 'payload';

/**
 * After an event is created, handle side effects based on event type
 */
export const afterChange: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  const { payload, user } = req;

  if (operation !== 'create' || !user) return doc;

  const transactionId = extractID(doc.transaction);

  // Generate sequence number if not set
  if (!doc.sequenceNumber) {
    const existingEvents = await payload.find({
      req,
      collection: 'transaction-events',
      where: {
        transaction: {
          equals: transactionId,
        },
      },
      sort: '-sequenceNumber',
      limit: 1,
    });

    const nextSequence =
      existingEvents.docs.length > 0 ? (existingEvents.docs[0]?.sequenceNumber ?? 0 + 1) : 1;

    await payload.update({
      req,
      collection: 'transaction-events',
      id: doc.id,
      data: {
        sequenceNumber: nextSequence,
      },
    });
  }

  // Handle specific event types
  switch (doc.type) {
    case 'ProposalAccepted':
      await handleProposalAccepted(payload, doc as TransactionEvent, transactionId);
      break;

    case 'DeliveryScheduled':
      await handleDeliveryScheduled(payload, doc as TransactionEvent, transactionId);
      break;

    case 'StatusChanged':
      await handleStatusChanged(payload, doc as TransactionEvent, transactionId);
      break;

    case 'TransactionCreated':
      await handleTransactionCreated(req, doc as TransactionEvent, transactionId);
      break;
  }

  return doc;
};

/**
 * When a proposal is accepted, check if both parties agreed
 * If yes, mark proposal as accepted and create DeliveryScheduled event
 */
async function handleProposalAccepted(
  payload: Payload,
  event: TransactionEvent,
  transactionId: string
) {
  const proposalId = (event.payload as Record<string, unknown>)?.proposalId as string;
  if (!proposalId) return;

  // Get all agreements for this proposal
  const agreements = await payload.find({
    collection: 'proposal-agreements',
    where: {
      proposal: {
        equals: proposalId,
      },
      agreed: {
        equals: true,
      },
    },
  });

  // If both parties agreed, update proposal status and create DeliveryScheduled event
  if (agreements.docs.length >= 2) {
    await payload.update({
      collection: 'delivery-proposals',
      id: proposalId,
      data: {
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
      },
    });

    // Mark other proposals as superseded
    const allProposals = await payload.find({
      collection: 'delivery-proposals',
      where: {
        transaction: {
          equals: transactionId,
        },
        id: {
          not_equals: proposalId,
        },
        status: {
          equals: 'pending',
        },
      },
    });

    for (const proposal of allProposals.docs) {
      await payload.update({
        collection: 'delivery-proposals',
        id: proposal.id,
        data: {
          status: 'superseded',
        },
      });
    }

    // Create DeliveryScheduled event
    await payload.create({
      collection: 'transaction-events',
      data: {
        transaction: transactionId,
        type: 'DeliveryScheduled',
        payload: {
          proposalId,
        },
        actor: event.actor,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

/**
 * When delivery is scheduled, update transaction status
 */
async function handleDeliveryScheduled(
  payload: Payload,
  event: TransactionEvent,
  transactionId: string
) {
  await payload.update({
    collection: 'transactions',
    id: transactionId,
    data: {
      status: 'DELIVERY_SCHEDULED',
    },
  });
}

/**
 * When status changes, update the transaction
 */
async function handleStatusChanged(
  payload: Payload,
  event: TransactionEvent,
  transactionId: string
) {
  const newStatus = (event.payload as Record<string, unknown>)?.status as string;
  if (!newStatus) return;

  await payload.update({
    collection: 'transactions',
    id: transactionId,
    data: {
      status: newStatus,
    },
  });
}

/**
 * When transaction is created, update related collections
 */
async function handleTransactionCreated(
  req: PayloadRequest,
  event: TransactionEvent,
  transactionId: string
) {
  const getTransaction = () =>
    req.payload.findByID({
      req,
      collection: 'transactions',
      id: transactionId,
    });

  const transaction = await getTransaction();

  const promises: Promise<void>[] = [];

  // Update donation status
  if (transaction.donation) {
    const donationId = extractID(transaction.donation);
    const promise = async () => {
      await req.payload.update({
        req,
        collection: 'donations',
        id: donationId,
        data: { status: DONATION_REQUEST_STATUS.MATCHED.value },
      });
    };
    promises.push(promise());
  }

  const bagIDs = transaction.matchedBags.map(extractID);

  // Update request status and milk bags
  if (transaction.request) {
    const requestId = extractID(transaction.request);
    const promise = async () => {
      await req.payload.update({
        req,
        collection: 'requests',
        id: requestId,
        data: {
          status: DONATION_REQUEST_STATUS.MATCHED.value,
          details: { bags: bagIDs },
        },
      });
    };
    promises.push(promise());
  }

  // Update milk bag statuses
  if (bagIDs.length > 0) {
    const promise = async () => {
      await req.payload.update({
        req,
        collection: 'milkBags',
        where: { id: { in: bagIDs } },
        data: { status: 'ALLOCATED' },
      });
    };
    promises.push(promise());
  }

  // Execute all updates in parallel
  await Promise.all(promises);

  return getTransaction();
}
