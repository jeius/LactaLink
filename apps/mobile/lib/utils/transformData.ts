import {
  AddressSchema,
  DeliveryPreferenceSchema,
  DonationSchema,
  ImageSchema,
  MilkBagCreateSchema,
  MilkBagSchema,
  RequestSchema,
} from '@lactalink/form-schemas';
import { FileCollection } from '@lactalink/types/collections';
import {
  Address,
  DeliveryPreference,
  Donation,
  MilkBag,
  Request,
} from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import { PHILIPPINES_COORDINATES } from '../constants';

type BaseInput = string | null | undefined;
type BaseReturn<T, B extends boolean> = B extends true
  ? Exclude<T, BaseInput>
  : T extends string
    ? null
    : T;
type BaseOptions<B extends boolean> = {
  /**
   * If true, will throw an error when a shallow collection (id only) is provided.
   * If false, will return null for shallow collections.
   * @default true
   */
  throwOnShallowCollection?: B;
};

type TransformedMilkBag<T, B extends boolean> = T extends MilkBag
  ? MilkBagSchema
  : BaseReturn<T, B>;

export function transformToMilkBagSchema<T extends MilkBag | BaseInput, B extends boolean = true>(
  bag: T,
  options: BaseOptions<B> = { throwOnShallowCollection: true } as BaseOptions<B>
): TransformedMilkBag<T, B> {
  if (!bag) return bag as TransformedMilkBag<T, B>;

  if (typeof bag === 'string') {
    if (options.throwOnShallowCollection) {
      throw new Error(
        'Unable to transform MilkBag into MilkBagSchema. Shallow collection provided.'
      );
    }
    return null as TransformedMilkBag<T, B>;
  }

  return {
    id: bag.id,
    volume: bag.volume,
    code: bag.code,
    status: bag.status,
    collectedAt: bag.collectedAt,
    donor: extractID(bag.donor),
    bagImage: transformToImageSchema(bag.bagImage),
  } as TransformedMilkBag<T, B>;
}

type TransformedMilkBagCreate<T, B extends boolean> = T extends MilkBag
  ? MilkBagCreateSchema
  : BaseReturn<T, B>;
export function transformToMilkBagCreateSchema<T extends MilkBag | BaseInput, B extends boolean>(
  bag: T,
  options: BaseOptions<B> = { throwOnShallowCollection: true } as BaseOptions<B>
): TransformedMilkBagCreate<T, B> {
  if (!bag) return bag as TransformedMilkBagCreate<T, B>;

  if (typeof bag === 'string') {
    if (options.throwOnShallowCollection) {
      throw new Error(
        'Unable to transform MilkBag into MilkBagCreateSchema. Shallow collection provided.'
      );
    }
    return null as TransformedMilkBag<T, B>;
  }

  return {
    id: bag.id,
    volume: bag.volume,
    collectedAt: bag.collectedAt,
    donor: extractID(bag.donor),
  } as TransformedMilkBagCreate<T, B>;
}

type TransformedAddress<T, B extends boolean> = T extends Address
  ? AddressSchema
  : BaseReturn<T, B>;

export function transformToAddressSchema<T extends Address | BaseInput, B extends boolean>(
  address: T,
  options: BaseOptions<B> = { throwOnShallowCollection: true } as BaseOptions<B>
): TransformedAddress<T, B> {
  if (!address) return address as TransformedAddress<T, B>;
  if (typeof address === 'string') {
    if (options.throwOnShallowCollection) {
      throw new Error(
        'Unable to transform Address into AddressSchema. Shallow collection provided.'
      );
    }
    return null as TransformedAddress<T, B>;
  }

  const coordinates =
    (address.coordinates && pointToLatLng(address.coordinates)) || PHILIPPINES_COORDINATES;

  return {
    id: address.id,
    name: address.name || '',
    zipCode: address.zipCode || '',
    street: address.street || '',
    province: extractID(address.province),
    barangay: (address.barangay && extractID(address.barangay)) || undefined,
    cityMunicipality: extractID(address.cityMunicipality),
    isDefault: address.isDefault || false,
    coordinates,
  } as TransformedAddress<T, B>;
}

type TransformedDP<T, B extends boolean> = T extends DeliveryPreference
  ? DeliveryPreferenceSchema
  : BaseReturn<T, B>;

export function transformToDeliveryPreferenceSchema<
  T extends DeliveryPreference | BaseInput,
  B extends boolean,
>(
  deliveryPreference: T,
  options: BaseOptions<B> = { throwOnShallowCollection: true } as BaseOptions<B>
): TransformedDP<T, B> {
  if (!deliveryPreference) return deliveryPreference as TransformedDP<T, B>;
  if (typeof deliveryPreference === 'string') {
    if (options.throwOnShallowCollection) {
      throw new Error(
        'Unable to transform DeliveryPreference into DeliveryPreferenceSchema. Shallow collection provided.'
      );
    }
    return null as TransformedDP<T, B>;
  }

  return {
    id: deliveryPreference.id,
    address: transformToAddressSchema(deliveryPreference.address, options),
    availableDays: deliveryPreference.availableDays,
    preferredMode: deliveryPreference.preferredMode,
    name: deliveryPreference.name,
  } as TransformedDP<T, B>;
}

type TransformedImageSchema<T, B extends boolean> = T extends FileCollection
  ? ImageSchema
  : BaseReturn<T, B>;

export function transformToImageSchema<T extends FileCollection | BaseInput, B extends boolean>(
  image: T,
  options: BaseOptions<B> = { throwOnShallowCollection: true } as BaseOptions<B>
): TransformedImageSchema<T, B> {
  if (!image) return image as TransformedImageSchema<T, B>;

  if (typeof image === 'string') {
    if (options.throwOnShallowCollection) {
      throw new Error('Unable to transform Image into ImageSchema. Shallow collection provided.');
    }
    return null as TransformedImageSchema<T, B>;
  }

  return {
    id: image.id,
    filename: image.filename || 'image.jpg',
    mimeType: image.mimeType || 'image/jpeg',
    url: image.url,
    width: image.width || 300,
    height: image.height || 300,
    alt: image.alt || 'Image',
    filesize: image.filesize || 0,
    blurhash: image.blurHash || undefined,
  } as TransformedImageSchema<T, B>;
}

type TransformedDonation<T, B extends boolean> = T extends Donation
  ? DonationSchema
  : BaseReturn<T, B>;

export function transformToDonationSchema<T extends Donation | BaseInput, B extends boolean>(
  donation: T,
  options: BaseOptions<B> = { throwOnShallowCollection: true } as BaseOptions<B>
): TransformedDonation<T, B> {
  if (!donation) return donation as TransformedDonation<T, B>;
  if (typeof donation === 'string') {
    if (options.throwOnShallowCollection) {
      throw new Error(
        'Unable to transform Donation into DonationSchema. Shallow collection provided.'
      );
    }
    return null as TransformedDonation<T, B>;
  }

  const image = donation.details.milkSample?.pop();

  const bags = donation.details.bags
    .map((bag) => transformToMilkBagCreateSchema(bag, options))
    .filter(Boolean) as MilkBagCreateSchema[];

  const milkBags = donation.details.bags
    .map((bag) => transformToMilkBagSchema(bag, options))
    .filter(Boolean) as MilkBagSchema[];

  const deliveryPreferences = (donation.deliveryPreferences || [])
    .map((pref) => transformToDeliveryPreferenceSchema(pref, options))
    .filter(Boolean) as DeliveryPreferenceSchema[];

  return {
    id: donation.id,
    donor: extractID(donation.donor),
    recipient: donation.recipient,
    deliveryPreferences,
    milkBags,
    details: {
      ...donation.details,
      bags: bags,
      image: transformToImageSchema(image),
    },
  } as TransformedDonation<T, B>;
}

type TransformedRequest<T, B extends boolean> = T extends Request
  ? RequestSchema
  : BaseReturn<T, B>;

export function transformToRequestSchema<T extends Request | BaseInput, B extends boolean>(
  request: T,
  options: BaseOptions<B> = { throwOnShallowCollection: true } as BaseOptions<B>
): TransformedRequest<T, B> {
  if (!request) return request as TransformedRequest<T, B>;
  if (typeof request === 'string') {
    if (options.throwOnShallowCollection) {
      throw new Error(
        'Unable to transform Request into RequestSchema. Shallow collection provided.'
      );
    }
    return null as TransformedRequest<T, B>;
  }

  const milkBags = request.details.bags
    ?.map((bag) => transformToMilkBagSchema(bag, options))
    .filter(Boolean) as MilkBagSchema[] | undefined;

  const deliveryPreferences = (request.deliveryPreferences || [])
    .map((pref) => transformToDeliveryPreferenceSchema(pref, options))
    .filter(Boolean) as DeliveryPreferenceSchema[];

  return {
    id: request.id,
    requester: extractID(request.requester),
    recipient: request.recipient,
    volumeNeeded: request.volumeNeeded,
    deliveryPreferences,
    details: {
      ...request.details,
      bags: milkBags,
      image: transformToImageSchema(request.details.image),
    },
  } as TransformedRequest<T, B>;
}
