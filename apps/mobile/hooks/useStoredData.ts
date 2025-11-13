import Storage from '@/lib/localStorage';
import { InfiniteDataMap } from '@/lib/types';
import { type Draft, produce } from 'immer';
import { useCallback, useMemo } from 'react';
import { MMKV } from 'react-native-mmkv';

export function useStoredData<T>(key: string, storage: MMKV = Storage) {
  const value = useMemo(() => {
    const stored = storage.getString(key);

    try {
      if (stored) {
        return JSON.parse(stored) as T;
      }
      return undefined;
    } catch (err) {
      console.warn('Failed to parse stored data', err);
      throw err;
    }
  }, [key, storage]);

  const setValue = useCallback(
    (data: T) => {
      storage.set(key, JSON.stringify(data));
    },
    [key, storage]
  );

  return [value, setValue] as const;
}

export function useStoredInfiniteData<T>(key: string) {
  const [storedData, setStoredData] = useStoredData<InfiniteDataMap<T>>(key);

  const converted = produce(storedData, (draft) => {
    draft?.pages.forEach((page) => {
      // Convert Array of entries back into Map
      page.docs = new Map(page.docs as unknown as [string, Draft<T>][]);
    });
  });

  const saveData = useCallback(
    (data: InfiniteDataMap<T>) => {
      setStoredData({
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          // Convert Map into Array of entries for storage serialization
          docs: Array.from(page.docs.entries()) as unknown as Map<string, T>,
        })),
      });
    },
    [setStoredData]
  );

  return [converted, saveData] as const;
}
