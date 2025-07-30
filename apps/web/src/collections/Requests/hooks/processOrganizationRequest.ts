import { Request } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionAfterChangeHook } from 'payload';

/**
 * Processes requests made directly to organizations (hospitals or milk banks)
 * When an organization accepts a request, it updates the request status and notifies the requester
 */
export const processOrganizationRequest: CollectionAfterChangeHook<Request> = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  // Only proceed if:
  // 1. The request has an organization recipient
  // 2. The status changed to MATCHED from something else
  // 3. There was a previous state (not a new request)
  if (
    !doc.recipient ||
    doc.status !== 'MATCHED' ||
    !previousDoc ||
    previousDoc.status === 'MATCHED' ||
    operation !== 'update'
  ) {
    return doc;
  }

  // Check if recipient is an organization (hospital or milk bank)
  const recipientType = doc.recipient.relationTo;

  if (recipientType === 'individuals') {
    return doc; // Not an organization recipient
  }

  const recipientId = extractID(doc.recipient.value);

  // Log the request acceptance
  req.payload.logger.info(
    `Organization ${recipientType} ${recipientId} accepted request ${doc.id} from ${doc.requester}`
  );

  // The organization will now choose inventory items to fulfill this request
  // We don't need to create a donation automatically

  return doc;
};
