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

// Common type definitions
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

/**
 * Generic base transformer function that handles common transformation logic
 */
function baseTransformer<T, S, B extends boolean>(
  input: T | BaseInput,
  transformFn: (input: T) => S,
  options: BaseOptions<B> = { throwOnShallowCollection: true } as BaseOptions<B>,
  entityName: string
): BaseReturn<T | S, B> {
  if (!input) return input as BaseReturn<T, B>;

  if (typeof input === 'string') {
    if (options.throwOnShallowCollection) {
      throw new Error(`Unable to transform ${entityName}. Shallow collection provided.`);
    }
    return null as BaseReturn<T, B>;
  }

  return transformFn(input) as BaseReturn<T | S, B>;
}

// Type definitions for each transformer
type TransformedMilkBag<T, B extends boolean> = T extends MilkBag
  ? MilkBagSchema
  : BaseReturn<T, B>;

type TransformedMilkBagCreate<T, B extends boolean> = T extends MilkBag
  ? MilkBagCreateSchema
  : BaseReturn<T, B>;

type TransformedAddress<T, B extends boolean> = T extends Address
  ? AddressSchema
  : BaseReturn<T, B>;

type TransformedDP<T, B extends boolean> = T extends DeliveryPreference
  ? DeliveryPreferenceSchema
  : BaseReturn<T, B>;

type TransformedImageSchema<T, B extends boolean> = T extends FileCollection
  ? ImageSchema
  : BaseReturn<T, B>;

type TransformedDonation<T, B extends boolean> = T extends Donation
  ? DonationSchema
  : BaseReturn<T, B>;

type TransformedRequest<T, B extends boolean> = T extends Request
  ? RequestSchema
  : BaseReturn<T, B>;

/**
 * Transform MilkBag to MilkBagSchema
 */
export function transformToMilkBagSchema<T extends MilkBag | BaseInput, B extends boolean = true>(
  bag: T,
  options: BaseOptions<B> = { throwOnShallowCollection: true } as BaseOptions<B>
): TransformedMilkBag<T, B> {
  return baseTransformer<MilkBag, MilkBagSchema, B>(
    bag,
    (input) => ({
      id: input.id,
      volume: input.volume,
      code: input.code,
      status: input.status,
      collectedAt: input.collectedAt,
      donor: extractID(input.donor),
      bagImage: transformToImageSchema(input.bagImage),
    }),
    options,
    'MilkBag into MilkBagSchema'
  ) as TransformedMilkBag<T, B>;
}

/**
 * Transform MilkBag to MilkBagCreateSchema
 */
export function transformToMilkBagCreateSchema<T extends MilkBag | BaseInput, B extends boolean>(
  bag: T,
  options: BaseOptions<B> = { throwOnShallowCollection: true } as BaseOptions<B>
): TransformedMilkBagCreate<T, B> {
  return baseTransformer<MilkBag, MilkBagCreateSchema, B>(
    bag,
    (input) => ({
      id: input.id,
      volume: input.volume,
      collectedAt: input.collectedAt,
      donor: extractID(input.donor),
    }),
    options,
    'MilkBag into MilkBagCreateSchema'
  ) as TransformedMilkBagCreate<T, B>;
}

/**
 * Transform Address to AddressSchema
 */
export function transformToAddressSchema<T extends Address | BaseInput, B extends boolean>(
  address: T,
  options: BaseOptions<B> = { throwOnShallowCollection: true } as BaseOptions<B>
): TransformedAddress<T, B> {
  return baseTransformer<Address, AddressSchema, B>(
    address,
    (input) => {
      const coordinates =
        (input.coordinates && pointToLatLng(input.coordinates)) || PHILIPPINES_COORDINATES;

      return {
        id: input.id,
        name: input.name || '',
        zipCode: input.zipCode || '',
        street: input.street || '',
        displayName: input.displayName || '',
        province: extractID(input.province),
        barangay: (input.barangay && extractID(input.barangay)) || undefined,
        cityMunicipality: extractID(input.cityMunicipality),
        isDefault: input.isDefault || false,
        coordinates,
      };
    },
    options,
    'Address into AddressSchema'
  ) as TransformedAddress<T, B>;
}

/**
 * Transform DeliveryPreference to DeliveryPreferenceSchema
 */
export function transformToDeliveryPreferenceSchema<
  T extends DeliveryPreference | BaseInput,
  B extends boolean,
>(
  deliveryPreference: T,
  options: BaseOptions<B> = { throwOnShallowCollection: true } as BaseOptions<B>
): TransformedDP<T, B> {
  return baseTransformer<DeliveryPreference, DeliveryPreferenceSchema, B>(
    deliveryPreference,
    (input) => ({
      id: input.id,
      // @ts-expect-error Expected type error due to generic constraints
      address: transformToAddressSchema(input.address, options),
      availableDays: input.availableDays,
      preferredMode: input.preferredMode,
      name: input.name,
    }),
    options,
    'DeliveryPreference into DeliveryPreferenceSchema'
  ) as TransformedDP<T, B>;
}

/**
 * Transform FileCollection to ImageSchema
 */
export function transformToImageSchema<T extends FileCollection | BaseInput, B extends boolean>(
  image: T,
  options: BaseOptions<B> = { throwOnShallowCollection: true } as BaseOptions<B>
): TransformedImageSchema<T, B> {
  return baseTransformer<FileCollection, ImageSchema | null, B>(
    image,
    (input) => {
      const url = input.url || input.sizes?.thumbnail?.url;
      if (!url) return null;
      return {
        id: input.id,
        filename: input.filename || 'image.jpg',
        mimeType: input.mimeType || 'image/jpeg',
        url: url,
        width: input.width || 300,
        height: input.height || 300,
        alt: input.alt || 'Image',
        filesize: input.filesize || 0,
        blurhash: input.blurHash || undefined,
      };
    },
    options,
    'Image into ImageSchema'
  ) as TransformedImageSchema<T, B>;
}

/**
 * Transform Donation to DonationSchema
 */
export function transformToDonationSchema<T extends Donation | BaseInput, B extends boolean>(
  donation: T,
  options: BaseOptions<B> = { throwOnShallowCollection: true } as BaseOptions<B>
): TransformedDonation<T, B> {
  return baseTransformer<Donation, DonationSchema, B>(
    donation,
    (input) => {
      const image = input.details.milkSample?.pop();

      const bags = input.details.bags
        .map((bag) => transformToMilkBagCreateSchema(bag, options))
        .filter(Boolean) as MilkBagCreateSchema[];

      const milkBags = input.details.bags
        .map((bag) => transformToMilkBagSchema(bag, options))
        .filter(Boolean) as MilkBagSchema[];

      const deliveryPreferences = (input.deliveryPreferences || [])
        .map((pref) => transformToDeliveryPreferenceSchema(pref, options))
        .filter(Boolean) as DeliveryPreferenceSchema[];

      return {
        id: input.id,
        donor: extractID(input.donor),
        deliveryPreferences,
        milkBags,
        details: {
          ...input.details,
          notes: input.details.notes || '',
          bags: bags,
          image: transformToImageSchema(image),
        },
      };
    },
    options,
    'Donation into DonationSchema'
  ) as TransformedDonation<T, B>;
}

/**
 * Transform Request to RequestSchema
 */
export function transformToRequestSchema<T extends Request | BaseInput, B extends boolean>(
  request: T,
  options: BaseOptions<B> = { throwOnShallowCollection: true } as BaseOptions<B>
): TransformedRequest<T, B> {
  return baseTransformer<Request, RequestSchema, B>(
    request,
    (input) => {
      const milkBags = input.details.bags
        ?.map((bag) => transformToMilkBagSchema(bag, options))
        .filter(Boolean) as MilkBagSchema[] | undefined;

      const deliveryPreferences = (input.deliveryPreferences || [])
        .map((pref) => transformToDeliveryPreferenceSchema(pref, options))
        .filter(Boolean) as DeliveryPreferenceSchema[];

      return {
        id: input.id,
        requester: extractID(input.requester),
        volumeNeeded: input.volumeNeeded,
        deliveryPreferences,
        details: {
          ...input.details,
          storagePreference: input.details.storagePreference || 'EITHER',
          notes: input.details.notes || '',
          reason: input.details.reason || '',
          bags: milkBags,
          image: transformToImageSchema(input.details.image),
        },
      };
    },
    options,
    'Request into RequestSchema'
  ) as TransformedRequest<T, B>;
}
