import { updateInfiniteDataMap } from '@/lib/utils/infiniteListUtils';
import {
  DonorScreeningForm,
  DonorScreeningSubmission,
} from '@lactalink/types/payload-generated-types';
import { QueryClient } from '@tanstack/react-query';
import {
  createDraftSubmissionQuery,
  createOrganizationScreeningFormQuery,
  createScreeningFormsInfQuery,
  createStandardScreeningFormQuery,
  createSubmissionQuery,
} from './queryOptions';

export function addDraftSubmissionToCache(client: QueryClient, data: DonorScreeningSubmission) {
  const queryKey = createDraftSubmissionQuery(data.id).queryKey;
  client.setQueryData(queryKey, data);
}

export function addScreeningFormToCache(client: QueryClient, data: DonorScreeningForm) {
  const queryKey = createStandardScreeningFormQuery().queryKey;
  client.setQueryData(queryKey, data);
}

export function addScreeningFormToInfCache(client: QueryClient, data: DonorScreeningForm) {
  const queryKey = createScreeningFormsInfQuery().queryKey;
  client.setQueryData(queryKey, (oldData) => {
    if (!oldData) return oldData;
    return updateInfiniteDataMap(oldData, data, 'none');
  });
}

export function addSubmissionToCache(client: QueryClient, data: DonorScreeningSubmission) {
  const queryKey = createSubmissionQuery(data.id).queryKey;
  client.setQueryData(queryKey, data);
}

export function addFormToOrganizationFormCache(client: QueryClient, data: DonorScreeningForm) {
  const organization = data.organization;
  if (!organization) return;

  const queryKey = createOrganizationScreeningFormQuery(organization).queryKey;
  client.setQueryData(queryKey, data);
}
