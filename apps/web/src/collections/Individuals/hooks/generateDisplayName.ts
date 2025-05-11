import { Individual } from '@lactalink/types';
import { capitalizeAll } from '@lactalink/utilities';
import { CollectionBeforeChangeHook } from 'payload';

function sanitizeName(name: string) {
  return capitalizeAll(name.trim());
}

export const generateDisplayName: CollectionBeforeChangeHook<Individual> = async ({ data }) => {
  const { givenName, middleName, familyName } = data;

  if (!givenName || !familyName) return data;

  const sanitizedGivenName = sanitizeName(givenName);
  const sanitizedFamilyName = sanitizeName(familyName);

  let displayName = `${sanitizedGivenName} ${sanitizedFamilyName}`;

  if (middleName) {
    const middleInitial = `${middleName[0]}.`;
    displayName = `${sanitizedGivenName} ${middleInitial} ${sanitizedFamilyName}`;
  }

  data.displayName = displayName;
  return data;
};
