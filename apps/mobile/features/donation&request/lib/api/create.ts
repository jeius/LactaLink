import { getMeUser } from '@/lib/stores/meUserStore';
import { getApiClient } from '@lactalink/api';
import { MILK_BAG_STATUS } from '@lactalink/enums';
import { DonationCreateSchema, MilkBagSchema, RequestCreateSchema } from '@lactalink/form-schemas';
import { DonationCreateResult, RequestCreateResult } from '@lactalink/types/api';
import { extractDataFromResponse, extractID } from '@lactalink/utilities/extractors';
import { File } from 'expo-file-system';

export function createMilkBag({ volume, collectedAt, donor }: MilkBagSchema, init?: RequestInit) {
  const meUser = getMeUser();
  if (!meUser) throw new Error('User must be logged in to create a milk bag.');
  if (!meUser.profile) throw new Error('User must have a profile to create a milk bag.');

  const apiClient = getApiClient();

  return apiClient.create(
    {
      draft: true,
      collection: 'milkBags',
      data: {
        status: MILK_BAG_STATUS.AVAILABLE.value,
        volume: volume,
        collectedAt: collectedAt,
        donor: donor,
        owner: {
          relationTo: meUser.profile.relationTo,
          value: extractID(meUser.profile.value),
        },
        createdBy: meUser.id,
        // The following fields are required by the collection config but not relevant for
        // the create operation, so we set empty values just to avoid typescript errors.
        code: '',
        title: '',
        expiresAt: '',
      },
    },
    init
  );
}

export async function createDonation(
  data: DonationCreateSchema,
  init?: RequestInit
): Promise<DonationCreateResult> {
  const file = data.details.image ? new File(data.details.image.url) : undefined;

  const response = await getApiClient().request({
    path: '/donations/create',
    method: 'POST',
    file: file,
    json: data,
    init: init,
  });

  return extractDataFromResponse(response);
}

export async function createRequest(
  data: RequestCreateSchema,
  init?: RequestInit
): Promise<RequestCreateResult> {
  const file = data.details.image ? new File(data.details.image.url) : undefined;

  const response = await getApiClient().request({
    path: '/requests/create',
    method: 'POST',
    file: file,
    json: data,
    init: init,
  });

  return extractDataFromResponse(response);
}
