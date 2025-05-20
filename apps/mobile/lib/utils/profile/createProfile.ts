import { ProfileMapData, ProfileType } from '@/lib/types/profile';
import { ApiOptions, CollectionData } from '@lactalink/types';
import { createDoc } from '@lactalink/utilities';

type BaseFields<T extends ProfileType> = Pick<ProfileMapData[T]['output'], 'addresses' | 'avatar'>;
type Data<T extends ProfileType> = ProfileMapData[T]['input'] & BaseFields<T>;
type Options<T extends ProfileType> = Omit<
  ApiOptions<ProfileMapData[T]['output'], 'CREATE'>,
  'data' | 'collection'
>;

export const createProfile = async <T extends ProfileType>(
  data: Data<T>,
  options: Options<T>
): Promise<ProfileMapData[T]['output']> => {
  const { profileType } = data;
  switch (profileType) {
    case 'INDIVIDUAL': {
      const individualData: CollectionData<ProfileMapData['INDIVIDUAL']['output']> = {
        ...data,
        birth: data.birth.toDateString(),
      };
      return await createDoc<ProfileMapData['INDIVIDUAL']['output']>({
        ...options,
        collection: 'individuals',
        data: individualData,
      });
    }
    case 'HOSPITAL':
      return await createDoc<ProfileMapData['HOSPITAL']['output']>({
        ...options,
        collection: 'hospitals',
        data,
      });
    case 'MILK_BANK':
      return await createDoc<ProfileMapData['MILK_BANK']['output']>({
        ...options,
        collection: 'milkBanks',
        data,
      });
    default:
      throw new Error(`Unsupported profile type: ${profileType}`);
  }
};
