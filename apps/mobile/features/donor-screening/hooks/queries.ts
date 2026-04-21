import { UserProfile } from '@lactalink/types';
import { DonorScreeningForm } from '@lactalink/types/payload-generated-types';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { cacheOrganizationForm } from '../lib/cacheUtils';
import {
  createDraftSubmissionQuery,
  createOrganizationScreeningFormQuery,
  createPublishedSubmissionQuery,
  createScreeningFormQuery,
  createScreeningFormsInfQuery,
  createStandardScreeningFormQuery,
} from '../lib/queryOptions';

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

export function useDraftSubmissionQuery(formID: string | null | undefined) {
  return useQuery(createDraftSubmissionQuery(formID));
}

export function usePublishedSubmissionQuery(formID: string | null | undefined) {
  return useQuery(createPublishedSubmissionQuery(formID));
}

export function useInfiniteScreeningForms() {
  const queryClient = useQueryClient();
  const { data, ...query } = useInfiniteQuery(createScreeningFormsInfQuery());

  const { dataArray, dataMap } = useMemo(() => {
    const dataArray: DonorScreeningForm[] = [];
    const dataMap = new Map<string, DonorScreeningForm>();

    if (!data) return { dataArray, dataMap };

    data.pages.forEach((page) => {
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

export function useSubmittedStandardFormQuery() {}
