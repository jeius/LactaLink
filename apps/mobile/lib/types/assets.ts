import { Asset } from 'expo-asset';
import { AnimationObject } from 'lottie-react-native';
import { ICON_ASSETS, IMAGE_ASSETS, LOTTIE_ASSETS } from '../constants/assets';

export type IconAsset = typeof ICON_ASSETS;

export type ImageAsset = typeof IMAGE_ASSETS;

export type LottieAsset = typeof LOTTIE_ASSETS;

export type AssetObject = {
  images: Record<keyof ImageAsset, Asset>;
  icons: Record<keyof IconAsset, Asset>;
  lottie: Record<keyof LottieAsset, AnimationObject>;
};
