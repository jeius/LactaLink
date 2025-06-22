import { Asset } from 'expo-asset';
import { ICON_ASSETS, IMAGE_ASSETS } from '../constants';

export type IconAsset = typeof ICON_ASSETS;

export type ImageAsset = typeof IMAGE_ASSETS;

export type AssetObject = {
  images: Record<keyof ImageAsset, Asset>;
  icons: Record<keyof IconAsset, Asset>;
};
