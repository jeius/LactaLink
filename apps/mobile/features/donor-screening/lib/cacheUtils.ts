import { updateInfiniteDataMap } from '@/lib/utils/infiniteListUtils';
import {
  DonorScreeningForm,
  DonorScreeningSubmission,
} from '@lactalink/types/payload-generated-types';
import { QueryClient } from '@tanstack/react-query';
import {
  createOrganizationScreeningFormQuery,
  createOrgScreeningFormsInfQuery,
  createScreeningFormQuery,
  createSubmissionQuery,
} from './queryOptions';

type Options = {
  isDraft?: boolean;
  _status?: 'published' | 'draft';
};

// #region Submission Cache Utils
export function addSubmissionToCache(client: QueryClient, data: DonorScreeningSubmission) {
  const queryKey = createSubmissionQuery(data.id).queryKey;
  client.setQueryData(queryKey, data);
}
// #endregion

// #region Screening Form Cache Utils
export function addScreeningFormToCache(
  client: QueryClient,
  data: DonorScreeningForm,
  { isDraft }: Options = {}
) {
  const queryKey = createScreeningFormQuery(data.id, isDraft).queryKey;
  client.setQueryData(queryKey, data);
}

export function addScreeningFormToInfCache(client: QueryClient, data: DonorScreeningForm) {
  const queryKey = createOrgScreeningFormsInfQuery().queryKey;
  client.setQueryData(queryKey, (oldData) => {
    if (!oldData) return oldData;
    return updateInfiniteDataMap(oldData, data, 'none');
  });
}

export function cacheOrganizationForm(
  client: QueryClient,
  data: DonorScreeningForm,
  options?: Options
) {
  const organization = data.organization;
  if (!organization) return;

  const queryKey = createOrganizationScreeningFormQuery({ organization, ...options }).queryKey;
  client.setQueryData(queryKey, data);
}

export function addScreeningFormToDraftCache(client: QueryClient, data: DonorScreeningForm) {
  addScreeningFormToCache(client, data, { isDraft: true });
  cacheOrganizationForm(client, data, { isDraft: true });
}
// #endregion
