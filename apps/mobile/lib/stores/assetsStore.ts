import type { Asset } from 'expo-asset';
import { create } from 'zustand';
import { AssetObject } from '../types';

interface AssetsState {
  assets: AssetObject | null;
  setAssets: (assets: AssetObject) => void;
}

export const useAssetsStore = create<AssetsState>((set) => ({
  assets: null,
  setAssets: (assets) => set({ assets }),
}));

export function initializeAssets(assets: AssetObject) {
  const { setAssets } = useAssetsStore.getState();

  if (!assets.images || !assets.icons) {
    console.error('Invalid assets object provided. Ensure it contains images and icons.');
    return;
  }

  setAssets(assets);

  return assets;
}

export function setAssets(assets: Partial<AssetObject>) {
  const { assets: currentAssets, setAssets } = useAssetsStore.getState();

  if (!currentAssets) {
    console.warn('Assets not initialized. Please initialize assets first.');
    return;
  }

  if (assets.icons || assets.images) {
    setAssets({
      images: { ...currentAssets.images, ...assets.images },
      icons: { ...currentAssets.icons, ...assets.icons },
    });
  }
}

export function getIconAsset(name: keyof AssetObject['icons']): Asset {
  const { assets } = useAssetsStore.getState();
  if (!assets) {
    throw new Error('Assets not initialized. Please initialize assets first.');
  }
  return assets.icons[name];
}

export function getImageAsset(name: keyof AssetObject['images']): Asset {
  const { assets } = useAssetsStore.getState();
  if (!assets) {
    throw new Error('Assets not initialized. Please initialize assets first.');
  }
  return assets.images[name]!;
}
