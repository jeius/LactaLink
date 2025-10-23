import { TRANSACTION_STATUS } from '@lactalink/enums';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { CollectionBeforeChangeHook } from 'payload';

/**
 * Processes delivery agreements for transactions.
 * When both parties agree to a proposal, automatically updates transaction status.
 */
export const processDeliveryAgreements: CollectionBeforeChangeHook<Transaction> = async ({
  data,
  originalDoc,
  req,
  operation,
}) => {
  // Only run on updates
  if (operation !== 'update' || !originalDoc) {
    return data;
  }

  try {
    // Check if we have delivery proposals
    if (data.delivery?.proposed?.length) {
      const proposals = data.delivery.proposed;

      // Check each proposal for agreement changes
      for (let i = 0; i < proposals.length; i++) {
        const proposal = proposals[i];
        const originalProposal = originalDoc.delivery?.proposed?.[i];

        // Check if both parties have newly agreed
        const nowBothAgreed = proposal?.agreements?.bothAgreed === true;
        const wasBothAgreed = originalProposal?.agreements?.bothAgreed === true;

        // If agreement status changed to both agreed
        if (nowBothAgreed && !wasBothAgreed) {
          // Update transaction status to DELIVERY_SCHEDULED
          data.status = TRANSACTION_STATUS.DELIVERY_SCHEDULED.value;

          // Set confirmed delivery details from this proposal
          data.delivery.confirmed = {
            mode: proposal.mode,
            datetime: proposal.datetime,
            address: proposal.address,
            confirmedAt: new Date().toISOString(),
          };

          if (!data.tracking) {
            data.tracking = originalDoc.tracking || {};
          }

          // Add tracking history entry
          if (!data.tracking.statusHistory) {
            data.tracking.statusHistory = [];
          }

          data.tracking.statusHistory.push({
            status: 'DELIVERY_SCHEDULED',
            timestamp: new Date().toISOString(),
            notes: `Delivery automatically scheduled after both parties agreed to proposal #${i + 1}`,
          });

          req.payload.logger.info(
            `Transaction ${originalDoc.id}: Delivery scheduled automatically after both parties agreed to proposal #${i + 1}`
          );

          // Since we found a mutually agreed proposal, break out of the loop
          break;
        }
      }
    }
  } catch (error) {
    req.payload.logger.error(`Error processing delivery agreements: ${extractErrorMessage(error)}`);
  }

  return data;
};
