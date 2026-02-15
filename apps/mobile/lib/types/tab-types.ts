import { Route as RNRoute } from 'react-native-tab-view';

export type Route = RNRoute;

export interface SceneProps {
  /**
   * Refer to react-native-tab-view's Route type for more details.
   */
  route: Route;
  /**
   * Function to jump to a specific scene in the tab view. Refer to react-native-tab-view's jumpTo function for more details.
   * @param key The key of the scene to jump to.
   * @returns void
   */
  jumpTo: (key: string) => void;
}
