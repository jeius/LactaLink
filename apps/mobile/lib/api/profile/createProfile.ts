import { getApiClient } from '@lactalink/api';
import {
  Config,
  CreateArgs,
  ExtractKeys,
  Hospital,
  HospitalSchema,
  Individual,
  IndividualSchema,
  MilkBank,
  MilkBankSchema,
} from '@lactalink/types';
import { extractID } from '@lactalink/utilities';

type Input = IndividualSchema | HospitalSchema | MilkBankSchema;
type Output = Individual | Hospital | MilkBank;
type BaseFields = Pick<Output, 'avatar'>;
type Data = Input & BaseFields;
type Slug = ExtractKeys<Config['collections'], Output>;
type Options = Omit<CreateArgs<Slug>, 'collection' | 'data'>;

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
      const { avatar, profileType: _, ...data } = dataParams;
      const avatarID = avatar && extractID(avatar);

      return await client.create({
        ...options,
        collection: 'hospitals',
        data: {
          avatar: avatarID,
          ...data,
        },
      });
    }

    case 'MILK_BANK': {
      const { avatar, profileType: _, ...data } = dataParams;
      const avatarID = avatar && extractID(avatar);

      return await client.create({
        ...options,
        collection: 'milkBanks',
        data: {
          avatar: avatarID,
          ...data,
        },
      });
    }

    default: {
      const { avatar, profileType: _, ...data } = dataParams;
      const avatarID = avatar && extractID(avatar);

      return await client.create({
        ...options,
        collection: 'individuals',
        data: {
          avatar: avatarID,
          ...data,
        },
      });
    }
  }
}
