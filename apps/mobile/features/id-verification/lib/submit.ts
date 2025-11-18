import { deleteCollection } from '@/lib/api/delete';
import { upsertImage } from '@/lib/api/file';
import { getMeUser } from '@/lib/stores/meUserStore';
import { getApiClient } from '@lactalink/api';
import { ID_STATUS } from '@lactalink/enums';
import { IdentitySchema } from '@lactalink/form-schemas';
import { extractID } from '@lactalink/utilities/extractors';

export async function submitVerification(data: IdentitySchema) {
  const apiClient = getApiClient();
  const meUser = getMeUser();
  const profileID = extractID(meUser?.profile?.value);

  if (!profileID) throw new Error('You must have a profile to submit the verification.');

  const [idImageDoc, faceImageDoc] = await Promise.all([
    upsertImage('identity-images', data.idImage),
    upsertImage('identity-images', data.faceImage),
  ]);

  const { id, personalInfo, details } = data;

  if (id) {
    const updatedDoc = await apiClient.updateByID({
      collection: 'identities',
      id,
      data: {
        ...personalInfo,
        ...details,
        expirationDate: details.expiryDate,
        idImage: extractID(idImageDoc),
        refImage: extractID(faceImageDoc),
        status: ID_STATUS.PENDING.value,
      },
    });

    return { message: 'Identity updated successfully.', doc: updatedDoc };
  }

  const doc = await apiClient
    .create({
      collection: 'identities',
      data: {
        ...personalInfo,
        ...details,
        expirationDate: details.expiryDate,
        idImage: extractID(idImageDoc),
        refImage: extractID(faceImageDoc),
        status: ID_STATUS.PENDING.value,
        submittedBy: profileID,
      },
    })
    .catch(async (err) => {
      await Promise.all([
        deleteCollection('identity-images', extractID(idImageDoc), { silent: true }),
        deleteCollection('identity-images', extractID(faceImageDoc), { silent: true }),
      ]);
      throw err;
    });

  return { message: 'Verification submitted successfully.', doc };
}
