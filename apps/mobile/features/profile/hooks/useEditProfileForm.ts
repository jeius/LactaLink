import { transformToImageSchema } from '@/lib/utils/transformData';
import { zodResolver } from '@hookform/resolvers/zod';
import { ORGANIZATION_TYPES } from '@lactalink/enums';
import { EditProfileSchema, editProfileSchema } from '@lactalink/form-schemas';
import { PopulatedUserProfile } from '@lactalink/types';
import { isHospital, isIndividual, isMilkBank } from '@lactalink/utilities/type-guards';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export function useEditProfileForm(profile: PopulatedUserProfile | undefined | null) {
  const methods = useForm<EditProfileSchema>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: profile ? createValues(profile) : undefined,
  });

  const { reset } = methods;

  useEffect(() => {
    if (profile) reset(createValues(profile));
  }, [profile, reset]);

  return methods;
}

function createValues(profile: PopulatedUserProfile): EditProfileSchema | undefined {
  const slug = profile.relationTo;
  const doc = profile.value;

  if (slug === 'individuals' && isIndividual(doc)) {
    return {
      id: doc.id,
      slug: slug,
      profileType: 'INDIVIDUAL',
      givenName: doc.givenName,
      middleName: doc.middleName,
      familyName: doc.familyName,
      birth: doc.birth,
      dependents: doc.dependents === null ? 0 : doc.dependents,
      gender: doc.gender,
      maritalStatus: doc.maritalStatus,
      avatar: transformToImageSchema(doc.avatar),
      phone: doc.phone,
    };
  } else if (slug === 'hospitals' && isHospital(doc)) {
    return {
      id: doc.id,
      slug: slug,
      profileType: 'HOSPITAL',
      name: doc.name,
      description: doc.description,
      head: doc.head,
      hospitalID: doc.hospitalID,
      type: doc.type ?? ORGANIZATION_TYPES.OTHER.value,
      avatar: transformToImageSchema(doc.avatar),
      phone: doc.phone,
    };
  } else if (slug === 'milkBanks' && isMilkBank(doc)) {
    return {
      id: doc.id,
      slug: slug,
      profileType: 'MILK_BANK',
      name: doc.name,
      description: doc.description,
      type: doc.type ?? ORGANIZATION_TYPES.OTHER.value,
      head: doc.head,
      avatar: transformToImageSchema(doc.avatar),
      phone: doc.phone,
    };
  }
  return;
}
