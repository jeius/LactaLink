import { MMKV_KEYS } from '@/lib/constants';
import localStorage from '@/lib/localStorage';
import { getMeUser } from '@/lib/stores/meUserStore';
import { getApiClient } from '@lactalink/api';
import { UserSearch as Search, User } from '@lactalink/types/payload-generated-types';
import { createStorageKeyByUser } from '@lactalink/utilities';
import { extractID } from '@lactalink/utilities/extractors';

/**
 * Helper function to create a storage key for the current user
 */
function createStorageKey(user?: User | null) {
  const meUser = user || getMeUser();
  return createStorageKeyByUser(meUser, MMKV_KEYS.SEARCH_HISTORY);
}

/**
 * Get search history from local storage
 */
function getLocalSearchHistory(user?: User | null): Search[] | null {
  const storageKey = createStorageKey(user);
  const storedHistory = localStorage.getString(storageKey);
  if (storedHistory) {
    try {
      const parsedHistory = JSON.parse(storedHistory);
      if (!Array.isArray(parsedHistory)) {
        throw new Error('Invalid search history format');
      }

      return parsedHistory;
    } catch (e) {
      console.warn('Failed to parse search history from storage', e);
      return null;
    }
  }
  return null;
}

/**
 * Get search history from API
 */
async function getSearchHistory(): Promise<Search[] | null> {
  const apiClient = getApiClient();
  const searchIDs = await apiClient.getPreference<Search['id'][] | undefined | null>(
    MMKV_KEYS.SEARCH_HISTORY
  );

  if (!searchIDs || searchIDs.length === 0) {
    return null;
  }

  const result = await apiClient.find({
    collection: 'user-search',
    pagination: false,
    where: { id: { in: searchIDs } },
  });

  return result;
}

/**
 * Save search history to both local storage and API
 */
async function saveSearchHistory(history: Search[], user?: User | null): Promise<Search[]> {
  const apiClient = getApiClient();
  const storageKey = createStorageKey(user);
  localStorage.set(storageKey, JSON.stringify(history));

  await apiClient.updatePreference(MMKV_KEYS.SEARCH_HISTORY, extractID(history));
  return history;
}

export { createStorageKey, getLocalSearchHistory, getSearchHistory, saveSearchHistory };
