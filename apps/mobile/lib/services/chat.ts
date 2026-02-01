import { getApiClient } from '@lactalink/api';
import { ChatService } from '@lactalink/api/services';

export function getChatService() {
  const apiClient = getApiClient();
  return new ChatService(apiClient);
}
