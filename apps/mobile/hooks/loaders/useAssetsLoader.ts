import { ICON_ASSETS, IMAGE_ASSETS } from '@/lib/constants/assets';
import { initializeAssets } from '@/lib/stores';
import { AssetObject } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { Asset } from 'expo-asset';

export function useAssetsLoader() {
  const { data, isSuccess, error, isLoading } = useQuery({
    queryKey: ['assets', 'load'],
    queryFn: () => {
      const loadedIcons = loadIcons();
      const loadedImages = loadImages();
      const assets = initializeAssets({
        icons: loadedIcons,
        images: loadedImages,
      });

      return assets;
    },
    retry: false, // Disable automatic retries
    staleTime: Infinity,
    gcTime: Infinity,
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

function loadImages() {
  const images: Record<string, Asset> = {};
  const imageAssets = IMAGE_ASSETS;

  for (const [key, asset] of Object.entries(imageAssets)) {
    const loadedAsset = Asset.fromModule(asset);
    if (!loadedAsset || !loadedAsset.uri) {
      throw new Error(`💥 Failed to load asset: ${key}`);
    }
    images[key] = loadedAsset;
  }

  return images as AssetObject['images'];
}
