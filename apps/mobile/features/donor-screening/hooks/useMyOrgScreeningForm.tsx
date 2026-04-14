import { useMeUser } from '@/hooks/auth/useAuth';
import { useOrganizationScreeningFormQuery } from './queries';

export function useMyOrgScreeningForm() {
  const { data: meUser } = useMeUser();

  const organization = meUser?.profile?.relationTo === 'individuals' ? null : meUser?.profile;
  const { data: form, ...query } = useOrganizationScreeningFormQuery(organization);
  return { form, ...query };
}
