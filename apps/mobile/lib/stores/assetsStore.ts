import { create } from 'zustand';
import { ICON_ASSETS, IMAGE_ASSETS, LOTTIE_ASSETS } from '../constants';
import { AssetObject, IconAsset, ImageAsset, LottieAsset } from '../types';

interface AssetsState extends AssetObject {
  setAssets: (assets: AssetObject) => void;
}

export const useAssetsStore = create<AssetsState>((set) => ({
  images: IMAGE_ASSETS,
  icons: ICON_ASSETS,
  lottie: LOTTIE_ASSETS,
  setAssets: (assets) => set({ ...assets }),
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

export function getIconAsset(name: keyof IconAsset) {
  const { icons } = useAssetsStore.getState();
  return icons[name];
}

export function getImageAsset(name: keyof ImageAsset) {
  const { images } = useAssetsStore.getState();
  return images[name];
}

export function getLottieAsset(name: keyof LottieAsset) {
  const { lottie } = useAssetsStore.getState();
  return lottie[name];
}
