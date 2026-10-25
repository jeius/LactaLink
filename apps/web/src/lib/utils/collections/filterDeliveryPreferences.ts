import { Donation, Request, User } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import isString from 'lodash/isString';
import { FilterOptions, Where } from 'payload';

export const filterDeliveryPreferences: FilterOptions<Donation | Request> = async ({
  data,
  req,
}) => {
  const profile = 'donor' in data ? data.donor : data.requester;

  if (!profile) {
    return false; // No profile to filter by
  }

  let ownerID: string | null = null;

  if (isString(profile)) {
    // Donations still use an individual relationship.
    const profileDoc = await req.payload.findByID({
      collection: 'individuals',
      id: profile,
      depth: 0,
    });
    ownerID = profileDoc.owner ? extractID(profileDoc.owner) : null;
  } else {
    const profileObject = extractCollection(profile);

    if (profileObject && 'relationTo' in profileObject && 'value' in profileObject) {
      const relationTo = profileObject.relationTo as NonNullable<User['profile']>['relationTo'];
      const value = profileObject.value;

      if (isString(value)) {
        const profileDoc = await req.payload.findByID({
          collection: relationTo,
          id: value,
          depth: 0,
        });
        ownerID = profileDoc.owner ? extractID(profileDoc.owner) : null;
      } else {
        const populatedProfile = value as { owner?: string | { id: string } };
        if (populatedProfile.owner) {
          ownerID = extractID(populatedProfile.owner);
        }
      }
    } else if (profileObject && 'owner' in profileObject && profileObject.owner) {
      ownerID = extractID(profileObject.owner);
    }
  }

  if (!ownerID) {
    return false;
  }

  return {
    owner: { equals: ownerID },
  } as Where;
};
