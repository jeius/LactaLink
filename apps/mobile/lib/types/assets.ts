import { Asset } from 'expo-asset';
import { ICON_ASSETS } from '../constants';

export type IconAsset = typeof ICON_ASSETS;

export type AssetObject = {
  images: Record<string, Asset>;
  icons: Record<keyof IconAsset, Asset>;
};
