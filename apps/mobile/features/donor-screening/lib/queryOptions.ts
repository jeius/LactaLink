import { QUERY_KEYS } from '@/lib/constants';
import { generatePlaceHoldersForInfQueries } from '@/lib/utils/generatePlaceholdersForInfQueries';
import { UserProfile } from '@lactalink/types';
import { DonorScreeningForm, User } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { transformToPaginatedMappedDocs } from '@lactalink/utilities/transformers';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import {
  getFormByOrganization,
  getOrganizationForms,
  getScreeningForm,
  getStandardScreeningForm,
} from './api/find/getScreeningForm';
import { getSubmission, getSubmissions, getSubmissionsByUser } from './api/find/getSubmission';

// #region Screening Forms
export function createStandardScreeningFormQuery() {
  return queryOptions({
    queryKey: [...QUERY_KEYS.SCREENING_FORMS.ONE, 'standard'],
    queryFn: async ({ signal }) => {
      return getStandardScreeningForm({ signal });
    },
  });
}

export function createScreeningFormQuery(
  form: string | DonorScreeningForm | null | undefined,
  isDraft = false
) {
  const id = extractID(form);
  return queryOptions({
    enabled: !!id,
    queryKey: [...QUERY_KEYS.SCREENING_FORMS.ONE, isDraft ? 'draft' : null, id].filter(Boolean),
    queryFn: async ({ signal }) => {
      if (!id) return null;
      return getScreeningForm({ id, isDraft }, { signal });
    },
    placeholderData: (prev) => {
      if (prev) return prev;
      return extractCollection(form) || undefined;
    },
  });
}

export function createOrgScreeningFormsInfQuery() {
  return infiniteQueryOptions({
    initialPageParam: 1,
    queryKey: [...QUERY_KEYS.SCREENING_FORMS.INFINITE],
    queryFn: async ({ pageParam, signal }) => {
      const paginatedDocs = await getOrganizationForms({ page: pageParam }, { signal });
      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: (prev) => {
      if (prev) return prev;
      return generatePlaceHoldersForInfQueries(15);
    },
  });
}

export function createOrganizationScreeningFormQuery({
  organization,
  ...params
}: {
  organization: Exclude<UserProfile, { relationTo: 'individuals' }> | null | undefined;
  _status?: 'published' | 'draft';
  isDraft?: boolean;
}) {
  const id = organization ? extractID(organization.value) : null;
  const relationTo = organization?.relationTo || null;
  return queryOptions({
    enabled: !!id && !!relationTo,
    queryKey: [
      ...QUERY_KEYS.SCREENING_FORMS.ONE,
      params.isDraft ? 'draft' : undefined,
      params._status ? `status:${params._status}` : undefined,
      relationTo,
      id,
    ].filter(Boolean),
    queryFn: ({ signal }) => {
      if (!id || !relationTo) return null;
      return getFormByOrganization(
        { ...params, organization: { relationTo, value: id } },
        { signal }
      );
    },
  });
}
// #endregion

// #region Submissions

export function createSubmissionQuery(submissionID: string | null | undefined) {
  return queryOptions({
    enabled: !!submissionID,
    queryKey: [...QUERY_KEYS.SCREENING_FORM_SUBMISSIONS.ONE, submissionID],
    queryFn: async ({ signal }) => {
      if (!submissionID) {
        throw new Error('Submission ID is required to fetch submission');
      }
      return getSubmission(submissionID, { signal });
    },
  });
}

export function createSubmissionsInfQuery(formID: string | null | undefined) {
  return infiniteQueryOptions({
    initialPageParam: 1,
    queryKey: [...QUERY_KEYS.SCREENING_FORM_SUBMISSIONS.INFINITE, formID],
    queryFn: async ({ pageParam, signal }) => {
      const paginatedDocs = await getSubmissions({ formID, page: pageParam }, { signal });
      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: (prev) => {
      if (prev) return prev;
      return generatePlaceHoldersForInfQueries(15);
    },
  });
}

export function createSubmissionsByUserInfQuery(user?: string | User | null) {
  const userID = extractID(user);
  return infiniteQueryOptions({
    initialPageParam: 1,
    queryKey: [...QUERY_KEYS.SCREENING_FORM_SUBMISSIONS.INFINITE, 'user', userID].filter(Boolean),
    queryFn: async ({ pageParam, signal }) => {
      if (!userID) {
        throw new Error('User ID is required to fetch user submissions');
      }
      const paginatedDocs = await getSubmissionsByUser({ page: pageParam, userID }, { signal });
      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: (prev) => {
      if (prev) return prev;
      return generatePlaceHoldersForInfQueries(15);
    },
  });
}
// #endregion
