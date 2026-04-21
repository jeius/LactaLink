import { useMeUser } from '@/hooks/auth/useAuth';
import { useOrganizationScreeningFormQuery } from './queries';

export function useMyOrgScreeningForm(
  params: {
    _status?: 'published' | 'draft';
    isDraft?: boolean;
  } = {}
) {
  const { data: meUser } = useMeUser();

  const organization = meUser?.profile?.relationTo === 'individuals' ? null : meUser?.profile;
  const { data: form, ...query } = useOrganizationScreeningFormQuery({ ...params, organization });
  return { form, ...query };
}
