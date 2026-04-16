import { getMeUser } from '@/lib/stores/meUserStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { DonorScreeningFormSchema, donorScreeningFormSchema } from '@lactalink/form-schemas';
import { DonorScreeningForm } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export function useScreeningForm(form?: DonorScreeningForm | null) {
  const methods = useForm({
    resolver: zodResolver(donorScreeningFormSchema),
    defaultValues: createDefaultValues(form),
  });

  const { reset } = methods;

  useEffect(() => {
    const newValues = createDefaultValues(form);
    if (newValues) reset(newValues);
  }, [form, reset]);

  return methods;
}

function createDefaultValues(
  form?: DonorScreeningForm | null
): DonorScreeningFormSchema | undefined {
  const meUser = getMeUser();
  const profile = meUser?.profile;
  const defaultOrganization =
    profile && profile.relationTo !== 'individuals'
      ? { relationTo: profile.relationTo, value: extractID(profile.value) }
      : undefined;

  if (!form)
    return {
      fields: [],
      sections: [],
      organization: defaultOrganization,
      slug: undefined!, // Will be auto-generated on the backend if not provided
      title: '',
    };

  const {
    createdAt: _createdAt,
    id: _id,
    updatedAt: _updatedAt,
    emails: _emails,
    organization,
    ...rest
  } = form;

  return {
    ...rest,
    organization: organization
      ? { relationTo: organization.relationTo, value: extractID(organization.value) }
      : defaultOrganization,
  };
}
