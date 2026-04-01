import { getSavedFormData } from '@/lib/localStorage/utils';
import { transformToMilkBagSchema } from '@/lib/utils/transformData';
import { DonationCreateSchema, RequestCreateSchema } from '@lactalink/form-schemas';
import { MilkBag, User } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { DeepPartial } from 'react-hook-form';

export function getDonationDefaultValues(
  user: User | null,
  { isMatched, hasRecipient }: { isMatched: boolean; hasRecipient: boolean }
): DonationCreateSchema | undefined {
  const profile = user?.profile?.value;
  const savedData = getSavedFormData('donation-create');

  const baseValues: DeepPartial<DonationCreateSchema> = {
    deliveryPreferences: savedData?.deliveryPreferences ?? [],
    donor: savedData?.donor ?? extractID(profile),
    details: {
      ...savedData?.details,
      bags: savedData?.details?.bags ?? [],
      notes: savedData?.details?.notes ?? '',
    },
  };

  if (isMatched) {
    return { ...baseValues, type: 'MATCHED' } as DonationCreateSchema;
  } else if (hasRecipient) {
    return { ...baseValues, type: 'DIRECT' } as DonationCreateSchema;
  } else {
    return { ...baseValues, type: 'OPEN' } as DonationCreateSchema;
  }
}

export function getRequestDefaultValues(
  user: User | null,
  { isMatched, hasRecipient }: { isMatched: boolean; hasRecipient: boolean }
): RequestCreateSchema | undefined {
  const profile = user?.profile?.value;
  const savedData = getSavedFormData('request-create');

  const baseValues: DeepPartial<RequestCreateSchema> = {
    deliveryPreferences: savedData?.deliveryPreferences ?? [],
    requester: savedData?.requester ?? extractID(profile),
    details: {
      ...savedData?.details,
      notes: savedData?.details?.notes ?? '',
      reason: savedData?.details?.reason ?? '',
    },
  };

  if (isMatched) {
    return { ...baseValues, type: 'MATCHED' } as RequestCreateSchema;
  } else if (hasRecipient) {
    return { ...baseValues, type: 'DIRECT' } as RequestCreateSchema;
  } else {
    return { ...baseValues, type: 'OPEN' } as RequestCreateSchema;
  }
}

export function transformDraftBags(milkbags: MilkBag[]) {
  return milkbags.map((bag) => transformToMilkBagSchema(bag));
}

export function getPreferredDonationValues(
  data: DonationCreateSchema
): DeepPartial<DonationCreateSchema> {
  return {
    details: {
      notes: data.details.notes,
      collectionMode: data.details.collectionMode,
      storageType: data.details.storageType,
    },
    deliveryPreferences: data.deliveryPreferences,
  };
}

export function getPreferredRequestValues(
  data: RequestCreateSchema
): DeepPartial<RequestCreateSchema> {
  return {
    details: {
      notes: data.details.notes,
      reason: data.details.reason,
      storagePreference: data.details.storagePreference,
    },
    deliveryPreferences: data.deliveryPreferences,
  };
}
