import { DonorScreeningSubmission } from '@lactalink/types/payload-generated-types';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { addSubmissionToCache } from '../lib/cacheUtils';
import { createSubmissionsInfQuery } from '../lib/queryOptions';

export function useInfiniteSubmissions(formID: string | null | undefined) {
  const queryClient = useQueryClient();
  const { data, isPlaceholderData, ...query } = useInfiniteQuery(createSubmissionsInfQuery(formID));

  const { dataArray, dataMap } = useMemo(() => {
    const dataMap = new Map<string, DonorScreeningSubmission>();
    const dataArray: DonorScreeningSubmission[] = [];

    data?.pages.forEach((page) => {
      page.docs.forEach((submission) => {
        dataMap.set(submission.id, submission);
        dataArray.push(submission);

        if (!isPlaceholderData) {
          addSubmissionToCache(queryClient, submission);
        }
      });
    });

    return { dataArray, dataMap };
  }, [data?.pages, isPlaceholderData, queryClient]);

  return { data: dataArray, dataMap, isPlaceholderData, ...query };
}
