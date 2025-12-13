import { DeliveryProposal } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterChangeHook } from 'payload';

/**
 * After a proposal is created/updated, emit corresponding transaction event
 */
export const afterChange: CollectionAfterChangeHook<DeliveryProposal> = async ({
  doc,
  operation,
  req,
}) => {
  const { payload, user } = req;

  if (!user) return doc;

  // Only emit events for create and update operations
  if (operation === 'create') {
    // Emit DeliveryProposed event
    await payload.create({
      collection: 'transaction-events',
      data: {
        transaction: typeof doc.transaction === 'string' ? doc.transaction : doc.transaction.id,
        type: 'DeliveryProposed',
        payload: {
          proposalId: doc.id,
          mode: doc.mode,
          datetime: doc.datetime,
          address: doc.address,
          instructions: doc.instructions,
        },
        actor: doc.proposedBy,
        timestamp: doc.createdAt,
      },
    });
  }

  if (operation === 'update' && doc.status === 'accepted' && !doc.acceptedAt) {
    // Emit ProposalAccepted event (first time being accepted)
    await payload.create({
      collection: 'transaction-events',
      data: {
        transaction: typeof doc.transaction === 'string' ? doc.transaction : doc.transaction.id,
        type: 'ProposalAccepted',
        payload: {
          proposalId: doc.id,
        },
        actor: extractID(user),
        timestamp: new Date().toISOString(),
      },
    });
  }

  if (operation === 'update' && doc.status === 'rejected' && !doc.rejectedAt) {
    // Emit ProposalRejected event (first time being rejected)
    await payload.create({
      collection: 'transaction-events',
      data: {
        transaction: typeof doc.transaction === 'string' ? doc.transaction : doc.transaction.id,
        type: 'ProposalRejected',
        payload: {
          proposalId: doc.id,
          reason: doc.instructions, // Could add rejection reason field
        },
        actor: doc.rejectedBy,
        timestamp: new Date().toISOString(),
      },
    });
  }

  return doc;
};
