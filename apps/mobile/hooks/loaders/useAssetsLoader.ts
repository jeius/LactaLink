import { ICON_ASSETS } from '@/lib/constants/assets';
import { initializeAssets } from '@/lib/stores';
import { AssetObject } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { Asset } from 'expo-asset';

export function useAssetsLoader() {
  const { data, isSuccess, error, isLoading } = useQuery({
    queryKey: ['assets', 'load'],
    queryFn: async () => {
      const loadedIcons = loadIcons();
      const assets = initializeAssets({
        icons: loadedIcons,
        images: {}, // Todo: Load images
      });

      return assets;
    },
    retry: false, // Disable automatic retries
    // staleTime: Infinity,
    // gcTime: Infinity,
  });

  return { isSuccess, error, isLoading, data };
}

function loadIcons() {
  const icons: Record<string, Asset> = {};
  const iconAssets = ICON_ASSETS;

  for (const [key, asset] of Object.entries(iconAssets)) {
    const loadedAsset = Asset.fromModule(asset);
    if (!loadedAsset || !loadedAsset.uri) {
      throw new Error(`💥 Failed to load asset: ${key}`);
    }
    icons[key] = loadedAsset;
  }

  return icons as AssetObject['icons'];
}

async function loadIconsAsync() {
  const icons: Record<string, Asset> = {};
  const iconAssets = ICON_ASSETS;

  const loadedIcons = await Promise.all(
    Object.entries(iconAssets).map(async ([key, asset]) => {
      const loadedAsset = await Asset.loadAsync(asset);
      if (!loadedAsset || loadedAsset.length === 0) {
        throw new Error(`💥 Failed to load asset: ${key}`);
      }

      icons[key] = loadedAsset[0]!;
      return { [key]: loadedAsset[0]! };
    })
  );

  if (loadedIcons.length === 0) {
    throw new Error('❌ No assets were loaded successfully.');
  }

  console.log('✅ Icon assets loaded:', Object.keys(icons).length);

  return icons as AssetObject['icons'];
}
