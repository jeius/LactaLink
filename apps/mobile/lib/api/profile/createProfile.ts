import { getApiClient } from '@lactalink/api';
import {
  Config,
  ExtractKeys,
  Hospital,
  HospitalSchema,
  Individual,
  IndividualSchema,
  MilkBank,
  MilkBankSchema,
  S,
} from '@lactalink/types';
import { extractID } from '@lactalink/utilities';

type Input = IndividualSchema | HospitalSchema | MilkBankSchema;
type Output = Individual | Hospital | MilkBank;
type BaseFields = Pick<Output, 'addresses' | 'avatar'>;
type Data = Input & BaseFields;
type Slug = ExtractKeys<Config['collections'], Output>;
type Options = Omit<S<Slug>, 'collection'>;

const defaultOptions: Options = {
  depth: 0,
  select: { id: true },
};

export async function createProfile(
  dataParams: Data,
  options: Options = defaultOptions
): Promise<Output> {
  const client = getApiClient();

  switch (dataParams.profileType) {
    case 'HOSPITAL': {
      const { addresses, avatar, profileType: _, ...data } = dataParams;
      const addressIDs = extractID(addresses);
      const avatarID = avatar && extractID(avatar);

      return await client.create({
        ...options,
        collection: 'hospitals',
        data: {
          avatar: avatarID,
          addresses: addressIDs,
          ...data,
        },
      });
    }

    case 'MILK_BANK': {
      const { addresses, avatar, profileType: _, ...data } = dataParams;
      const addressIDs = extractID(addresses);
      const avatarID = avatar && extractID(avatar);

      return await client.create({
        ...options,
        collection: 'milkBanks',
        data: {
          avatar: avatarID,
          addresses: addressIDs,
          ...data,
        },
      });
    }

    default: {
      const { addresses, avatar, profileType: _, ...data } = dataParams;
      const addressIDs = extractID(addresses);
      const avatarID = avatar && extractID(avatar);

      return await client.create({
        ...options,
        collection: 'individuals',
        data: {
          avatar: avatarID,
          addresses: addressIDs,
          ...data,
        },
      });
    }
  }
}
