import { Route } from 'react-native-tab-view';

export interface SceneProps {
  route: Route;
  jumpTo: (key: string) => void;
  useBottomSheetList?: boolean;
}
