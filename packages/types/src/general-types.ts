import { DAYS, DELIVERY_OPTIONS, DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { CollectionSlug } from './payload-types';
import {
  Hospital,
  Identity,
  Individual,
  MilkBank,
  Post,
  Transaction,
  User,
} from './payload-types/generated';

export type Theme = 'light' | 'dark';
export type ImageData = {
  uri: string | null;
  alt: string;
  blurHash: string;
};

export type DonationRequestStatus = keyof typeof DONATION_REQUEST_STATUS;
export type DeliveryMode = keyof typeof DELIVERY_OPTIONS;
export type DeliveryDays = keyof typeof DAYS;

export type IDType = Identity['idType'];
export type IDStatus = Identity['status'];
export type Gender = NonNullable<Individual['gender']>;

export type TransactionStatus = Transaction['status'];

export type MediaAttachment = NonNullable<Post['attachments']>[number];

export type UserProfile = NonNullable<User['profile']>;

export type PopulatedUserProfile =
  | {
      relationTo: Extract<CollectionSlug, 'individuals'>;
      value: Individual;
    }
  | {
      relationTo: Extract<CollectionSlug, 'hospitals'>;
      value: Hospital;
    }
  | {
      relationTo: Extract<CollectionSlug, 'milkBanks'>;
      value: MilkBank;
    };
