import { Route } from 'react-native-tab-view';

export interface SceneProps<T = unknown> {
  route: Route;
  jumpTo: (key: string) => void;
  useBottomSheetList?: boolean;
  onPress?: (data: T) => void;
}
