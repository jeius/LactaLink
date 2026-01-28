import {
  DeliveryDetail,
  DeliveryUpdate,
  Transaction,
  User,
} from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { areStrings } from '@lactalink/utilities/type-guards';

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

export function extractDeliveryDetail(transaction: Transaction): DeliveryDetail | null {
  const deliveryDetail = transaction.deliveryDetails?.docs;

  if (!deliveryDetail || deliveryDetail.length === 0) {
    return null;
  }

  const detail = deliveryDetail[0]!;
  const detailDoc = extractCollection(detail);

  if (!detailDoc) {
    throw new Error('Delivery Detail is not populated.');
  }

  return detailDoc;
}

export function extractDeliveryUpdate(
  transaction: Transaction,
  user: string | User
): DeliveryUpdate | null {
  const deliveryUpdates = transaction.deliveryUpdates?.docs;

  if (!deliveryUpdates || deliveryUpdates.length === 0) {
    return null;
  }

  if (areStrings(deliveryUpdates)) {
    throw new Error('Delivery Updates are not populated.');
  }

  const updatesDocs = extractCollection(deliveryUpdates);

  return updatesDocs.find((update) => extractID(update.user) === extractID(user)) ?? null;
}
