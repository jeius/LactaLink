import { getMeUser } from '@/lib/stores/meUserStore';
import { getApiClient } from '@lactalink/api';
import { MILK_BAG_STATUS } from '@lactalink/enums';
import { DonationCreateSchema, MilkBagSchema } from '@lactalink/form-schemas';
import { ApiFetchResponse, DonationCreateResult } from '@lactalink/types/api';
import { AbortError } from '@lactalink/utilities/errors';
import { extractID } from '@lactalink/utilities/extractors';
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

  const responseData: ApiFetchResponse<DonationCreateResult> = await response.json();

  if (!response.ok) {
    const message = 'error' in responseData ? responseData.message : 'Failed to create donation.';

    console.log(responseData);

    if (response.status === 499) {
      throw new AbortError(message);
    }

    throw new Error(message, {
      cause: {
        status: response.status,
        statusText: response.statusText,
        body: responseData,
      },
    });
  }

  if ('error' in responseData) {
    throw new Error(responseData.message);
  }

  return responseData.data;
}
