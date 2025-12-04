import { getApiClient, useApiClient } from '@lactalink/api';
import { ChatService } from '@lactalink/api/services';

export function getChatService() {
  const apiClient = getApiClient();
  return new ChatService(apiClient);
}

export function useChatService() {
  const apiClient = useApiClient();
  return new ChatService(apiClient);
}
