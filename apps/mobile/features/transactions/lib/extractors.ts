import { DeliveryDetail, Transaction } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';

export function extractDeliveryPlan(transaction: Transaction): DeliveryDetail | null {
  const deliveryPlans = transaction.deliveryPlans?.docs;

  if (!deliveryPlans || deliveryPlans.length === 0) {
    return null;
  }

  const plan = deliveryPlans[0]!;
  const planDoc = extractCollection(plan);

  if (!planDoc) {
    throw new Error('Delivery plan is not populated.');
  }

  return planDoc;
}
