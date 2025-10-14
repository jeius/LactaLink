import { FormProps } from '@/components/contexts/FormProvider';
import { deleteSavedFormData, getSavedFormData, saveFormData } from '@/lib/localStorage/utils';
import { transformToImageSchema } from '@/lib/utils/transformData';
import { zodResolver } from '@hookform/resolvers/zod';
import { identitySchema, IdentitySchema } from '@lactalink/form-schemas';
import { Identity, User } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { isIndividual } from '@lactalink/utilities/type-guards';
import debounce from 'lodash/debounce';
import { useEffect, useState } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';
import { useMeUser } from '../auth/useAuth';
import { useFetchById } from '../collections/useFetchById';

const debouncedSave = debounce((value) => saveFormData('identity-create', value), 200);

export function useIdentityVerificationForm(): Omit<FormProps<IdentitySchema>, 'children'> {
  const { data: user, ...userQuery } = useMeUser();

  const [id, setId] = useState<string>();

  const { data: identity, ...query } = useFetchById(!!id, {
    collection: 'identities',
    id: id || '',
  });

  const form = useForm({
    resolver: zodResolver(identitySchema),
    defaultValues: createDefaultValues(user),
  });

  const {
    reset,
    watch,
    formState: { isSubmitSuccessful },
  } = form;

  useEffect(() => {
    if (user && !identity) {
      const defaultValues = createDefaultValues(user);
      reset(defaultValues);
    } else if (identity) {
      const transformed = transformToIdentitySchema(identity);
      reset(transformed);
    }
  }, [identity, reset, user]);

  // Watch form changes and save to local storage (debounced).
  useEffect(() => {
    const { unsubscribe } = watch((values) => {
      debouncedSave(values);
      setId(values.id);
    });

    return () => {
      unsubscribe();
      debouncedSave.cancel();
    };
  }, [watch]);

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

function transformToIdentitySchema(data: Identity): IdentitySchema {
  const idImage = extractCollection(data.idImage);
  const faceImage = extractCollection(data.refImage);

  return {
    id: data.id,
    personalInfo: {
      givenName: data.givenName,
      middleName: data.middleName || '',
      familyName: data.familyName,
      address: data.address || '',
      suffix: data.suffix || '',
      birth: data.birth || '',
    },
    details: {
      idType: data.idType,
      idNumber: data.idNumber,
      issueDate: data.issueDate,
      expiryDate: data.expirationDate,
    },
    idImage: (idImage ? transformToImageSchema(idImage) : undefined) as IdentitySchema['idImage'],
    faceImage: (faceImage
      ? transformToImageSchema(faceImage)
      : undefined) as IdentitySchema['faceImage'],
  };
}
