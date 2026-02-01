import { getApiClient } from '@lactalink/api';
import { MatchingService, ReadTrackingService, TransactionService } from '@lactalink/api/services';

export * from './chat';

export function getTransactionService() {
  const apiClient = getApiClient();
  return new TransactionService(apiClient);
}

export function getMatchingService() {
  const apiClient = getApiClient();
  return new MatchingService(apiClient);
}

export function getReadTrackingService() {
  const apiClient = getApiClient();
  return new ReadTrackingService(apiClient);
}
