import { getApiClient, useApiClient } from '@lactalink/api';
import { MatchingService, TransactionService } from '@lactalink/api/services';

export * from './chat';

export function getTransactionService() {
  const apiClient = getApiClient();
  return new TransactionService(apiClient);
}

export function useTransactionService() {
  const apiClient = useApiClient();
  return new TransactionService(apiClient);
}

export function getMatchingService() {
  const apiClient = getApiClient();
  return new MatchingService(apiClient);
}
