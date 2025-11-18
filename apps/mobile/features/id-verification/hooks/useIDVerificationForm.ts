import { FormProps } from '@/components/contexts/FormProvider';
import { useMeUser } from '@/hooks/auth/useAuth';
import { deleteSavedFormData, getSavedFormData } from '@/lib/localStorage/utils';
import { transformToIdentitySchema } from '@/lib/utils/transformData';
import { zodResolver } from '@hookform/resolvers/zod';
import { identitySchema, IdentitySchema } from '@lactalink/form-schemas';
import { User } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { isIndividual } from '@lactalink/utilities/type-guards';
import { useEffect } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';
import { useIdentityQuery } from './useIdentity';

export function useIDVerificationForm(): Omit<FormProps<IdentitySchema>, 'children'> {
  const { data: user, ...userQuery } = useMeUser();

  const form = useForm({
    resolver: zodResolver(identitySchema),
    defaultValues: createDefaultValues(user),
  });

  const {
    reset,
    formState: { isSubmitSuccessful },
  } = form;

  const { data: identity, ...query } = useIdentityQuery((data) =>
    reset(transformToIdentitySchema(data))
  );

  useEffect(() => {
    if (isSubmitSuccessful) {
      deleteSavedFormData('identity-create');
    }
  }, [isSubmitSuccessful]);

  return {
    ...form,
    isFetching: userQuery.isFetching || query.isFetching,
    isLoading: userQuery.isLoading || query.isLoading,
    fetchError: userQuery.error || query.error,
    refreshing: userQuery.isRefetching || query.isRefetching,
    onRefresh: () => {
      userQuery.refetch();
      query.refetch();
    },
  };
}

function createDefaultValues(user: User | null): IdentitySchema {
  const stored = getSavedFormData('identity-create');

  const defaultValues: DeepPartial<IdentitySchema> = {
    personalInfo: {
      givenName: '',
      middleName: '',
      familyName: '',
      suffix: '',
      address: '',
    },
    details: { idNumber: '' },
  };

  if (stored) return stored as IdentitySchema;

  if (user) {
    const profile = extractCollection(user.profile?.value);

    if (profile && isIndividual(profile)) {
      return {
        ...defaultValues,
        personalInfo: {
          ...defaultValues.personalInfo,
          givenName: profile.givenName || '',
          middleName: profile.middleName || '',
          familyName: profile.familyName || '',
          birth: profile.birth || '',
        },
      } as IdentitySchema;
    }
  }

  return defaultValues as IdentitySchema;
}
