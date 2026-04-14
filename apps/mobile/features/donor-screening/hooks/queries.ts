import { UserProfile } from '@lactalink/types';
import { DonorScreeningForm } from '@lactalink/types/payload-generated-types';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { addFormToOrganizationFormCache } from '../lib/cacheUtils';
import {
  createDraftSubmissionQuery,
  createOrganizationScreeningFormQuery,
  createPublishedSubmissionQuery,
  createScreeningFormsInfQuery,
  createStandardScreeningFormQuery,
} from '../lib/queryOptions';

export function useStandardScreeningFormQuery() {
  return useQuery(createStandardScreeningFormQuery());
}

export function useOrganizationScreeningFormQuery(
  organization: Exclude<UserProfile, { relationTo: 'individuals' }> | null | undefined
) {
  return useQuery(createOrganizationScreeningFormQuery(organization));
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
          addFormToOrganizationFormCache(queryClient, form);
        }
      });
    });

    return { dataArray, dataMap };
  }, [data, query.isPlaceholderData, queryClient]);

  return { ...query, data: dataArray, dataMap };
}

export function useSubmittedStandardFormQuery() {}
