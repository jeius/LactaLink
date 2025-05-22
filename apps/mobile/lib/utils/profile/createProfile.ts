import {
  ApiOptions,
  Config,
  Hospital,
  HospitalSchema,
  Individual,
  IndividualSchema,
  KeysMatching,
  MilkBank,
  MilkBankSchema,
} from '@lactalink/types';
import { createDoc } from '@lactalink/utilities';

type Input = IndividualSchema | HospitalSchema | MilkBankSchema;
type Output = Individual | Hospital | MilkBank;
type BaseFields = Pick<Output, 'addresses' | 'avatar'>;
type Data = Input & BaseFields;
type Slug = KeysMatching<Config['collections'], Output>;
type Options = Omit<ApiOptions<Slug, 'CREATE'>, 'data' | 'collection'>;

export async function createProfile(data: Data, options: Options): Promise<Output> {
  const { profileType } = data;
  switch (profileType) {
    case 'INDIVIDUAL': {
      return await createDoc({
        ...options,
        collection: 'individuals',
        data,
      });
    }
    case 'HOSPITAL':
      return await createDoc({
        ...options,
        collection: 'hospitals',
        data,
      });
    case 'MILK_BANK':
      return await createDoc({
        ...options,
        collection: 'milkBanks',
        data,
      });
    default:
      throw new Error(`Unsupported profile type: ${profileType}`);
  }
}
