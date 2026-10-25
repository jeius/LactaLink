import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { isDonation, isRequest } from '@lactalink/utilities/type-guards';
import isEqual from 'lodash/isEqual';
import { FieldHook } from 'payload';
import { getProfileReference } from '../_helpers/profileReference';

/**
 * Field hook to generate the title for Donation and Request collections based on the
 * associated individual's name and volume.
 */
export const generateTitle: FieldHook<Donation | Request, string, Donation | Request> = async ({
  data,
  req,
  value,
  originalDoc,
  operation,
}) => {
  const defaultTitle = 'Untitled';

  if (!data) return defaultTitle;

  const generate = async () => {
    const isDonation = 'donor' in data;
    const isRequest = 'requester' in data;

    const actor = isDonation ? data.donor : isRequest ? data.requester : null;
    const { id, relationTo } = getProfileReference(actor);

    if (!id) return defaultTitle;

    const doc = await req.payload.findByID({
      req,
      collection: relationTo,
      id,
      depth: 0,
      select: { displayName: true },
    });

    const name = doc.displayName || 'Unknown User';
    const volume = isDonation ? data.volume : isRequest ? data.initialVolumeNeeded : 0;

    return `${name} | ${volume ?? 0} mL`;
  };

  // Generate on create
  if (operation === 'create') {
    return await generate();
  } else if (operation === 'update' && originalDoc) {
    const { actor: prevActor, volume: prevVolume } = isDonation(originalDoc)
      ? { actor: getProfileReference(originalDoc.donor), volume: originalDoc.volume }
      : isRequest(originalDoc)
        ? {
            actor: getProfileReference(originalDoc.requester),
            volume: originalDoc.initialVolumeNeeded,
          }
        : {};

    const { actor: newActor, volume: newVolume } =
      'donor' in data
        ? { actor: getProfileReference(data.donor), volume: data.volume }
        : 'requester' in data
          ? { actor: getProfileReference(data.requester), volume: data.initialVolumeNeeded }
          : {};

    // If neither the actor nor the volume has changed, keep the existing title
    // to avoid unnecessary updates
    if (isEqual(newActor, prevActor) && isEqual(newVolume, prevVolume))
      return value || defaultTitle;

    return await generate();
  }

  // For other operations, keep existing title
  return value || defaultTitle;
};
