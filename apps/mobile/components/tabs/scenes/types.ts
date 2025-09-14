import { CollectionSlug } from '@lactalink/types/payload-types';
import { Route } from 'react-native-tab-view';

export interface SceneProps<T = unknown> {
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
  /**
   * If true, uses a FlashList optimized for BottomSheet usage (e.g., better performance when used inside a BottomSheet).
   * Only set to true if the scene is rendered inside a BottomSheet.
   */
  useBottomSheetList?: boolean;
  /**
   * Fires when an item in the list is pressed.
   * @param data The data object for the selected item in the list.
   * @returns void
   */
  onPress?: (data: T) => void;
  /**
   * If true, thumbnail images will be viewable in full screen when tapped.
   */
  canViewThumbnails?: boolean;
  /**
   * Specifies the collection to use for the action button in each item.
   * For example, if set to 'donations', the action button will navigate to the donation creation screen.
   */
  actionCollection?: CollectionSlug;
}
