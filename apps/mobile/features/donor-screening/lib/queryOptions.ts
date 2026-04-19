import { QUERY_KEYS } from '@/lib/constants';
import { UserProfile } from '@lactalink/types';
import { DonorScreeningForm } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { transformToPaginatedMappedDocs } from '@lactalink/utilities/transformers';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import {
  getAllScreeningForms,
  getFormByOrganization,
  getScreeningForm,
  getStandardScreeningForm,
} from './api/find/getScreeningForm';
import {
  getMyDraftSubmissionForm,
  getSubmission,
  getSubmittedStandardForm,
} from './api/find/getSubmission';

export function createStandardScreeningFormQuery() {
  return queryOptions({
    queryKey: [...QUERY_KEYS.SCREENING_FORMS.ONE, 'standard'],
    queryFn: async ({ signal }) => {
      return getStandardScreeningForm({ signal });
    },
  });
}

export function createScreeningFormsInfQuery() {
  return infiniteQueryOptions({
    initialPageParam: 1,
    queryKey: [...QUERY_KEYS.SCREENING_FORMS.INFINITE],
    queryFn: async ({ pageParam, signal }) => {
      const paginatedDocs = await getAllScreeningForms({ page: pageParam }, { signal });
      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
  });
}

export function createOrganizationScreeningFormQuery(
  organization: Exclude<UserProfile, { relationTo: 'individuals' }> | null | undefined
) {
  const id = organization ? extractID(organization.value) : null;
  const relationTo = organization?.relationTo || null;
  return queryOptions({
    enabled: !!id && !!relationTo,
    queryKey: [...QUERY_KEYS.SCREENING_FORMS.ONE, relationTo, id].filter(Boolean),
    queryFn: ({ signal }) => {
      if (!organization) return null;
      return getFormByOrganization(organization, { signal });
    },
  });
}

export function createDraftSubmissionQuery(formID: string | null | undefined) {
  return queryOptions({
    enabled: !!formID,
    queryKey: [...QUERY_KEYS.SCREENING_FORM_SUBMISSIONS.ONE, 'draft', formID],
    queryFn: async ({ signal }) => {
      if (!formID) return null;
      return getMyDraftSubmissionForm(formID, { signal });
    },
  });
}

export function createPublishedSubmissionQuery(formID: string | null | undefined) {
  return queryOptions({
    enabled: !!formID,
    queryKey: [...QUERY_KEYS.SCREENING_FORM_SUBMISSIONS.ONE, 'published', formID],
    queryFn: async ({ signal }) => {
      if (!formID) return null;
      return getSubmittedStandardForm({ formID, status: 'published' }, { signal });
    },
  });
}

export function createSubmissionQuery(submissionID: string | null | undefined) {
  return queryOptions({
    enabled: !!submissionID,
    queryKey: [...QUERY_KEYS.SCREENING_FORM_SUBMISSIONS.ONE, submissionID],
    queryFn: async ({ signal }) => {
      if (!submissionID) return null;
      return getSubmission(submissionID, { signal });
    },
  });
}

export function createScreeningFormQuery(form: string | DonorScreeningForm | null | undefined) {
  const id = extractID(form);
  return queryOptions({
    enabled: !!id,
    queryKey: [...QUERY_KEYS.SCREENING_FORMS.ONE, id],
    queryFn: async ({ signal }) => {
      if (!id) return null;
      return getScreeningForm(id, { signal });
    },
    placeholderData: (prev) => {
      if (prev) return prev;
      return extractCollection(form) || undefined;
    },
  });
}
