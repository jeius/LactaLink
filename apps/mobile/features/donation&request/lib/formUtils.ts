import { getSavedFormData } from '@/lib/localStorage/utils';
import { transformToMilkBagSchema } from '@/lib/utils/transformData';
import { DonationCreateSchema } from '@lactalink/form-schemas';
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
