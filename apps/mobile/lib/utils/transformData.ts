import { DeliveryPreferenceSchema, ImageSchema, MilkBagSchema } from '@lactalink/form-schemas';
import { FileCollection } from '@lactalink/types/collections';
import { DeliveryPreference, MilkBag } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';

type BaseInput = string | null | undefined;
type BaseReturn<T> = T extends string ? null : T;

type TransformedMilkBagShema<T> = T extends MilkBag ? MilkBagSchema : BaseReturn<T>;

export function transformToMilkBagShema<T extends MilkBag | BaseInput>(
  bag: T
): TransformedMilkBagShema<T> {
  if (!bag) return bag as TransformedMilkBagShema<T>;

  if (typeof bag === 'string') return null as TransformedMilkBagShema<T>;

  return {
    id: bag.id,
    volume: bag.volume,
    code: bag.code,
    status: bag.status,
    collectedAt: bag.collectedAt,
    donor: extractID(bag.donor),
    bagImage: transformToImageSchema(bag.bagImage),
  } as TransformedMilkBagShema<T>;
}

type TransformedDeliverPreference<T> = T extends DeliveryPreference
  ? DeliveryPreferenceSchema
  : BaseReturn<T>;

export function transformToDeliveryPreferenceSchema<T extends DeliveryPreference | BaseInput>(
  deliveryPreference: T
): TransformedDeliverPreference<T> {
  if (!deliveryPreference) return deliveryPreference as TransformedDeliverPreference<T>;

  if (typeof deliveryPreference === 'string') return null as TransformedDeliverPreference<T>;

  return {
    id: deliveryPreference.id,
    address: extractID(deliveryPreference.address),
    availableDays: deliveryPreference.availableDays,
    preferredMode: deliveryPreference.preferredMode,
    name: deliveryPreference.name,
  } as TransformedDeliverPreference<T>;
}

type TransformedImageSchema<T> = T extends FileCollection ? ImageSchema : BaseReturn<T>;

export function transformToImageSchema<T extends FileCollection | BaseInput>(
  image: T
): TransformedImageSchema<T> {
  if (!image) return image as TransformedImageSchema<T>;

  if (typeof image === 'string') return null as TransformedImageSchema<T>;

  return {
    filename: image.filename || 'image.jpg',
    mimeType: image.mimeType || 'image/jpeg',
    url: image.url,
    width: image.width || 300,
    height: image.height || 300,
    alt: image.alt || 'Image',
    filesize: image.filesize || 0,
    blurhash: image.blurHash || undefined,
  } as TransformedImageSchema<T>;
}
