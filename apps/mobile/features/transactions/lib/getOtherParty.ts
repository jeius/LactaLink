import { getMeUser } from '@/lib/stores/meUserStore';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { isIndividual } from '@lactalink/utilities/type-guards';

export function getOtherParty(transaction: Transaction) {
  const meUser = getMeUser();
  if (!meUser) throw new Error('User not logged in');

  const meProfile = meUser.profile;
  if (!meProfile) throw new Error('MeUser profile not found');

  const isMeSender = isEqualProfiles(meUser.profile, transaction.sender);
  return isMeSender ? transaction.recipient : transaction.sender;
}

export function getOtherPartyDeliveryUpdates(transaction: Transaction) {
  const otherParty = getOtherParty(transaction);
  const deliveryUpdates = extractCollection(transaction.deliveryUpdates?.docs) || [];

  return deliveryUpdates.find((update) => {
    const otherPartyUser = extractCollection(otherParty.value)?.owner;
    const otherPartyUserID = extractID(otherPartyUser);
    const updateUserID = extractID(update.user);

    return updateUserID === otherPartyUserID;
  });
}

export function getOtherPartyName(transaction: Transaction) {
  const otherParty = getOtherParty(transaction);
  const otherPartyProfile = extractCollection(otherParty.value);
  if (!otherPartyProfile) return 'Unknown';
  return isIndividual(otherPartyProfile) ? otherPartyProfile.givenName : otherPartyProfile.name;
}
