import { Asset } from 'expo-asset';
import { useEffect, useState } from 'react';

export function useAppAssets() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadAssets() {
      try {
        await Asset.loadAsync([
          require('../assets/images/splash-icon.png'),
          // Add more assets here
        ]);
        setAssetsLoaded(true);
      } catch (err: unknown) {
        console.warn('Asset loading error:', err);
        setError(err as Error);
      }
    }

    loadAssets();
  }, []);

  return { assetsLoaded, error };
}
