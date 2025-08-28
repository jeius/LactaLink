import { getApiClient } from '@lactalink/api';
import {
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

export async function createProfile(dataParams: Data): Promise<Output> {
  const client = getApiClient();

  switch (dataParams.profileType) {
    case 'HOSPITAL': {
      const { avatar, profileType: _, ...data } = dataParams;
      const avatarID = avatar && extractID(avatar);

      return await client.create({
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
        collection: 'individuals',
        data: {
          avatar: avatarID,
          ...data,
        },
      });
    }
  }
}
