import { useMeUser } from '@/hooks/auth/useAuth';
import { UserProfile } from '@lactalink/types';
import {
  DonorScreeningForm,
  DonorScreeningSubmission,
} from '@lactalink/types/payload-generated-types';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { addSubmissionToCache, cacheOrganizationForm } from '../lib/cacheUtils';
import {
  createOrganizationScreeningFormQuery,
  createOrgScreeningFormsInfQuery,
  createScreeningFormQuery,
  createStandardScreeningFormQuery,
  createSubmissionQuery,
  createSubmissionsByUserInfQuery,
} from '../lib/queryOptions';

// #region Screening Form Queries
export function useStandardScreeningFormQuery() {
  return useQuery(createStandardScreeningFormQuery());
}

export function useScreeningFormQuery(id: string | null | undefined, isDraft?: boolean) {
  return useQuery(createScreeningFormQuery(id, isDraft));
}

export function useOrganizationScreeningFormQuery(params: {
  organization: Exclude<UserProfile, { relationTo: 'individuals' }> | null | undefined;
  _status?: 'published' | 'draft';
  isDraft?: boolean;
}) {
  return useQuery(createOrganizationScreeningFormQuery(params));
}

export function useInfiniteOrgScreeningForms() {
  const queryClient = useQueryClient();
  const { data, ...query } = useInfiniteQuery(createOrgScreeningFormsInfQuery());

  const { dataArray, dataMap } = useMemo(() => {
    const dataArray: DonorScreeningForm[] = [];
    const dataMap = new Map<string, DonorScreeningForm>();

    data?.pages.forEach((page) => {
      page.docs.forEach((form) => {
        dataArray.push(form);
        dataMap.set(form.id, form);

        if (query.isPlaceholderData) return;

        if (form.organization) {
          cacheOrganizationForm(queryClient, form);
        }
      });
    });

    return { dataArray, dataMap };
  }, [data, query.isPlaceholderData, queryClient]);

  return { ...query, data: dataArray, dataMap };
}
// #endregion

// #region Submission Queries
export function useSubmissionFormQuery(id: string | undefined | null) {
  return useQuery(createSubmissionQuery(id));
}

export function useMySubmissionsInfQuery() {
  const { data: meUser } = useMeUser();
  const queryClient = useQueryClient();
  const { data, isPlaceholderData, ...query } = useInfiniteQuery(
    createSubmissionsByUserInfQuery(meUser)
  );

  const { dataArray, dataMap } = useMemo(() => {
    const dataArray: DonorScreeningSubmission[] = [];
    const dataMap = new Map<string, DonorScreeningSubmission>();

    data?.pages.forEach((page) => {
      page.docs.forEach((submission) => {
        dataArray.push(submission);
        dataMap.set(submission.id, submission);

        if (isPlaceholderData || submission._status === 'draft') return;
        addSubmissionToCache(queryClient, submission);
      });
    });

    return { dataArray, dataMap };
  }, [data?.pages, isPlaceholderData, queryClient]);

  return { ...query, data: dataArray, dataMap, isPlaceholderData };
}
// #endregion
