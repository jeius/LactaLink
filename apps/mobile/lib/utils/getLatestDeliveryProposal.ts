import { ProposedDelivery } from '@lactalink/types/payload-generated-types';

export function getLatestDeliveryProposal(
  deliveryProposals: ProposedDelivery | null | undefined
): NonNullable<ProposedDelivery>[number] | null {
  if (!deliveryProposals || deliveryProposals.length === 0) return null;
  return deliveryProposals.reduce((latest, current) => {
    return new Date(current.proposedAt) > new Date(latest.proposedAt) ? current : latest;
  });
}
