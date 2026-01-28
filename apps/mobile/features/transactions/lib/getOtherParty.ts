import { getMeUser } from '@/lib/stores/meUserStore';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';

export function getOtherParty(transaction: Transaction) {
  const meUser = getMeUser();
  if (!meUser) throw new Error('User not logged in');

  const meProfile = meUser.profile;
  if (!meProfile) throw new Error('MeUser profile not found');

  const isMeSender = isEqualProfiles(meUser.profile, transaction.sender);
  return isMeSender ? transaction.recipient : transaction.sender;
}
