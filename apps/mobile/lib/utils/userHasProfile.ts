import { User } from '@lactalink/types';

export function userHasProfile(user: User) {
  const { type, individual, hospital, milkBank } = user;

  if (type === 'INDIVIDUAL') return Boolean(individual);

  if (type === 'HOSPITAL') return Boolean(hospital);

  if (type === 'MILK_BANK') return Boolean(milkBank);

  return false;
}
