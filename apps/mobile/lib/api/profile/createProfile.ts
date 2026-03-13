import { getApiClient } from '@lactalink/api';
import {
  HospitalSchema,
  ImageSchema,
  IndividualSchema,
  MilkBankSchema,
} from '@lactalink/form-schemas';
import { Hospital, Individual, MilkBank } from '@lactalink/types/payload-generated-types';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { File } from 'expo-file-system';

type Input = IndividualSchema | HospitalSchema | MilkBankSchema;
type Output = Individual | Hospital | MilkBank;
type BaseFields = { avatar?: ImageSchema | null };
type Data = Input & BaseFields;

const slugMap: Record<
  Input['profileType'],
  Extract<CollectionSlug, 'hospitals' | 'individuals' | 'milkBanks'>
> = {
  HOSPITAL: 'hospitals',
  INDIVIDUAL: 'individuals',
  MILK_BANK: 'milkBanks',
};

export async function createProfile(dataParams: Data): Promise<Output> {
  const client = getApiClient();
  const { avatar, profileType, ...data } = dataParams;
  const avatarURI = avatar?.url;

  const response = await client.request({
    path: `/${slugMap[profileType]}`,
    method: 'POST',
    file: avatarURI ? new File(avatarURI) : undefined,
    json: data,
    args: { depth: 3 },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create profile');
  }

  return response.json();
}
