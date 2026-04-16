import { getApiClient } from '@lactalink/api';
import { UserProfile } from '@lactalink/types';
import { DonorScreeningForm } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';

const DEPTH = 2;

export async function getStandardScreeningForm(init?: RequestInit): Promise<DonorScreeningForm> {
  const forms = await getApiClient().find(
    {
      collection: 'donor-screening-forms',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { slug: { equals: 'standard-screening-form' } },
          { isDefault: { equals: true } },
        ],
      },
      pagination: false,
      limit: 1,
      depth: DEPTH,
    },
    init
  );

  if (forms.length === 0) {
    throw new Error('Standard Donor Screening Form not found');
  }

  return forms[0]!;
}

export async function getFormByOrganization(
  organization: Exclude<UserProfile, { relationTo: 'individuals' }>,
  init?: RequestInit
): Promise<DonorScreeningForm | null> {
  const forms = await getApiClient().find(
    {
      collection: 'donor-screening-forms',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { 'organization.value': { equals: extractID(organization.value) } },
          { 'organization.relationTo': { equals: organization.relationTo } },
        ],
      },
      pagination: false,
      limit: 1,
      depth: DEPTH,
    },
    init
  );

  if (forms.length === 0) {
    return null;
  }

  return forms[0]!;
}

export async function getAllScreeningForms(
  { page, limit = 10 }: { limit?: number; page: number },
  init?: RequestInit
) {
  return getApiClient().find(
    {
      collection: 'donor-screening-forms',
      where: { _status: { equals: 'published' } },
      page: page,
      limit: limit,
      depth: DEPTH,
    },
    init
  );
}
