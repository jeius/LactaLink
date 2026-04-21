import { getApiClient } from '@lactalink/api';
import { UserProfile } from '@lactalink/types';
import { DonorScreeningForm } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { Where } from 'payload';

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
  {
    organization,
    _status,
    isDraft = false,
  }: {
    organization: Exclude<UserProfile, { relationTo: 'individuals' }>;
    _status?: 'published' | 'draft';
    isDraft?: boolean;
  },
  init?: RequestInit
): Promise<DonorScreeningForm | null> {
  const filters: Where[] = [
    { 'organization.value': { equals: extractID(organization.value) } },
    { 'organization.relationTo': { equals: organization.relationTo } },
  ];

  if (_status) {
    filters.push({ _status: { equals: _status } });
  }

  const forms = await getApiClient().find(
    {
      collection: 'donor-screening-forms',
      draft: isDraft,
      where: { and: filters },
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

export async function getScreeningForm(
  { id, isDraft = false }: { id: string; isDraft?: boolean },
  init?: RequestInit
) {
  return getApiClient().findByID(
    {
      collection: 'donor-screening-forms',
      id,
      depth: DEPTH,
      draft: isDraft,
    },
    init
  );
}
