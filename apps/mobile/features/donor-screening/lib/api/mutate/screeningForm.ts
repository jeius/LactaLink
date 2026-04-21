import { getMeUser } from '@/lib/stores/meUserStore';
import { getApiClient } from '@lactalink/api';
import { DonorScreeningFormSchema } from '@lactalink/form-schemas';
import { DonorScreeningFormField } from '@lactalink/types/collections';
import { extractID } from '@lactalink/utilities/extractors';
import { toKebabCase } from '@lactalink/utilities/formatters';
import { removeID } from '../../removeID';

export async function createDraftScreeningForm(templateID?: string, init?: RequestInit) {
  const apiClient = getApiClient();
  const depth = 2;
  const organization = getMeUser()?.profile;

  let data: DonorScreeningFormSchema = {
    title: undefined!, // It's okay to omit this since this is a draft
    _status: 'draft',
    organization:
      organization && organization.relationTo !== 'individuals'
        ? { relationTo: organization.relationTo, value: extractID(organization.value) }
        : undefined,
  };

  if (templateID) {
    const template = await apiClient.findByID(
      {
        collection: 'donor-screening-forms',
        id: templateID,
        depth: depth,
      },
      init
    );

    if (template) {
      const removeFieldIDs = (
        blocks: DonorScreeningFormField[]
      ): Omit<DonorScreeningFormField, 'id'>[] => {
        return blocks.map((b) => {
          if ('options' in b) {
            return { ...removeID(b), options: b.options.map((opt) => removeID(opt)) };
          }
          return removeID(b);
        });
      };

      data = {
        ...data,
        title: `Copy of ${template.title}`,
        fields: removeFieldIDs(template.fields || []), // Clear field IDs so they get regenerated
        sections: template.sections?.map((section) => ({
          ...removeID(section),
          fields: removeFieldIDs(section.fields || []), // Clear field IDs in sections as well
        })),
      } as DonorScreeningFormSchema;
    }
  }

  return apiClient.create(
    {
      collection: 'donor-screening-forms',
      draft: true,
      depth: depth,
      data: { ...data, slug: undefined! }, // Slug is auto-generated on the backend
    },
    init
  );
}

export async function saveScreeningForm(
  data: DonorScreeningFormSchema,
  id?: string,
  init?: RequestInit
) {
  const apiClient = getApiClient();
  const depth = 2;

  if (id) {
    return apiClient.updateByID(
      {
        collection: 'donor-screening-forms',
        id: id,
        draft: true,
        autoSave: true,
        depth: depth,
        data: { ...data, slug: toKebabCase(data.title) },
      },
      init
    );
  }

  return apiClient.create(
    {
      collection: 'donor-screening-forms',
      draft: true,
      depth: depth,
      data: { ...data, slug: toKebabCase(data.title) },
    },
    init
  );
}

export async function publishScreeningForm(id: string, init?: RequestInit) {
  const apiClient = getApiClient();
  return apiClient.updateByID(
    {
      collection: 'donor-screening-forms',
      id: id,
      depth: 2,
      data: { _status: 'published' },
    },
    init
  );
}

export async function deleteScreeningForm(id: string, init?: RequestInit) {
  const apiClient = getApiClient();
  return apiClient.deleteByID(
    {
      collection: 'donor-screening-forms',
      id: id,
    },
    init
  );
}
