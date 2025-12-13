import type { PayloadHandler } from 'payload';

/**
 * Transaction command types
 */
export type TransactionCommand =
  | { type: 'ProposeDelivery'; proposalData: ProposeDeliveryData }
  | { type: 'AcceptProposal'; proposalId: string }
  | { type: 'RejectProposal'; proposalId: string; reason?: string }
  | { type: 'AgreeToProposal'; proposalId: string }
  | { type: 'StartPreparing' }
  | { type: 'MarkReadyForPickup' }
  | { type: 'StartTransit' }
  | { type: 'MarkArrived'; partyType: 'sender' | 'recipient' }
  | { type: 'MarkDelivered' }
  | { type: 'CompleteTransaction' }
  | { type: 'FailTransaction'; reason: string }
  | { type: 'CancelTransaction'; reason: string };

interface ProposeDeliveryData {
  mode: string;
  datetime: string;
  address?: string;
  instructions?: string;
}

/**
 * Unified command endpoint for transaction actions
 * POST /api/transactions/:id/commands
 * Body: { command: TransactionCommand }
 */
export const commandHandler: PayloadHandler = async (req) => {
  const { user, payload } = req;
  const transactionId = req.routeParams?.id;
  const { command } = req.body as { command: TransactionCommand };

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!transactionId) {
    return Response.json({ error: 'Transaction ID is required' }, { status: 400 });
  }

  if (!command || !command.type) {
    return Response.json({ error: 'Command is required' }, { status: 400 });
  }

  try {
    // Fetch the transaction to verify access
    const transaction = await payload.findByID({
      collection: 'transactions',
      id: transactionId,
    });

    // Verify user is sender or recipient
    const senderId =
      typeof transaction.sender === 'string' ? transaction.sender : transaction.sender.id;
    const recipientId =
      typeof transaction.recipient === 'string' ? transaction.recipient : transaction.recipient.id;
    const userProfileId = user.profile?.value;

    if (userProfileId !== senderId && userProfileId !== recipientId && user.role !== 'ADMIN') {
      return Response.json(
        { error: 'Forbidden - not a party to this transaction' },
        { status: 403 }
      );
    }

    // Execute the command
    const result = await executeCommand(payload, transaction, command, user);

    return Response.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Command execution error:', error);
    return Response.json(
      {
        error: 'Command execution failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

/**
 * Execute a transaction command
 */
async function executeCommand(
  payload: any,
  transaction: any,
  command: TransactionCommand,
  user: any
) {
  switch (command.type) {
    case 'ProposeDelivery':
      return await proposeDelivery(payload, transaction, command.proposalData, user);

    case 'AgreeToProposal':
      return await agreeToProposal(payload, transaction, command.proposalId, user);

    case 'RejectProposal':
      return await rejectProposal(payload, transaction, command.proposalId, user, command.reason);

    case 'StartPreparing':
      return await changeStatus(
        payload,
        transaction,
        'READY_FOR_PICKUP',
        user,
        'Started preparing delivery'
      );

    case 'StartTransit':
      return await changeStatus(payload, transaction, 'IN_TRANSIT', user, 'Started transit');

    case 'MarkDelivered':
      return await changeStatus(payload, transaction, 'DELIVERED', user, 'Marked as delivered');

    case 'CompleteTransaction':
      return await changeStatus(payload, transaction, 'COMPLETED', user, 'Transaction completed');

    case 'FailTransaction':
      return await changeStatus(
        payload,
        transaction,
        'FAILED',
        user,
        `Transaction failed: ${command.reason}`
      );

    case 'CancelTransaction':
      return await changeStatus(
        payload,
        transaction,
        'CANCELLED',
        user,
        `Transaction cancelled: ${command.reason}`
      );

    case 'MarkArrived':
      return await markArrived(payload, transaction, command.partyType, user);

    default:
      throw new Error(`Unknown command type: ${(command as any).type}`);
  }
}

/**
 * Propose a delivery option
 */
async function proposeDelivery(
  payload: any,
  transaction: any,
  proposalData: ProposeDeliveryData,
  user: any
) {
  const proposal = await payload.create({
    collection: 'deliveryProposals',
    data: {
      transaction: transaction.id,
      mode: proposalData.mode,
      datetime: proposalData.datetime,
      address: proposalData.address,
      instructions: proposalData.instructions,
      proposedBy: user.profile?.value,
      status: 'pending',
    },
  });

  // DeliveryProposed event is created by the DeliveryProposals afterChange hook

  return {
    message: 'Delivery proposal created',
    proposal,
  };
}

/**
 * Agree to a delivery proposal
 */
async function agreeToProposal(payload: any, transaction: any, proposalId: string, user: any) {
  // Check if user already agreed
  const existingAgreement = await payload.find({
    collection: 'proposalAgreements',
    where: {
      and: [{ proposal: { equals: proposalId } }, { party: { equals: user.profile?.value } }],
    },
  });

  if (existingAgreement.docs.length > 0) {
    // Update existing agreement
    await payload.update({
      collection: 'proposalAgreements',
      id: existingAgreement.docs[0].id,
      data: {
        agreed: true,
        agreedAt: new Date().toISOString(),
      },
    });
  } else {
    // Create new agreement
    await payload.create({
      collection: 'proposalAgreements',
      data: {
        proposal: proposalId,
        party: user.profile?.value,
        agreed: true,
        agreedAt: new Date().toISOString(),
      },
    });
  }

  // Create ProposalAccepted event
  await payload.create({
    collection: 'transactionEvents',
    data: {
      transaction: transaction.id,
      type: 'ProposalAccepted',
      payload: { proposalId },
      actor: user.profile?.value,
      timestamp: new Date().toISOString(),
    },
  });

  return {
    message: 'Proposal agreement recorded',
  };
}

/**
 * Reject a delivery proposal
 */
async function rejectProposal(
  payload: any,
  transaction: any,
  proposalId: string,
  user: any,
  reason?: string
) {
  await payload.update({
    collection: 'deliveryProposals',
    id: proposalId,
    data: {
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: user.profile?.value,
    },
  });

  // ProposalRejected event is created by the DeliveryProposals afterChange hook

  return {
    message: 'Proposal rejected',
  };
}

/**
 * Change transaction status
 */
async function changeStatus(
  payload: any,
  transaction: any,
  newStatus: string,
  user: any,
  notes?: string
) {
  await payload.create({
    collection: 'transactionEvents',
    data: {
      transaction: transaction.id,
      type: 'StatusChanged',
      payload: {
        status: newStatus,
        previousStatus: transaction.status,
        notes,
      },
      actor: user.profile?.value,
      timestamp: new Date().toISOString(),
    },
  });

  return {
    message: `Status changed to ${newStatus}`,
    status: newStatus,
  };
}

/**
 * Mark party arrival at meetup location
 */
async function markArrived(
  payload: any,
  transaction: any,
  partyType: 'sender' | 'recipient',
  user: any
) {
  const arrivalField = partyType === 'sender' ? 'senderArrivedAt' : 'recipientArrivedAt';

  await payload.update({
    collection: 'transactions',
    id: transaction.id,
    data: {
      [`delivery.arrival.${arrivalField}`]: new Date().toISOString(),
    },
  });

  await payload.create({
    collection: 'transactionEvents',
    data: {
      transaction: transaction.id,
      type: 'ArrivedAtMeetup',
      payload: {
        partyType,
      },
      actor: user.profile?.value,
      timestamp: new Date().toISOString(),
    },
  });

  return {
    message: `${partyType} arrival recorded`,
  };
}
