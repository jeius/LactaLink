import { Tab } from '@/components/tabs/Tab';
import { useLiveCollectionRevalidator } from '@/hooks/live-updates/useLiveCollectionRevalidator';
import { CollectionSlug } from '@lactalink/types';
import { useMemo } from 'react';
import { Route, SceneMap } from 'react-native-tab-view';
import { DonationRequestScene } from './scenes/DonationRequestScene';
import { OrganizationScene } from './scenes/OrganizationScene';
import { SceneProps } from './scenes/types';

export function AvailableRequestsTab() {
  useLiveCollectionRevalidator('requests', ['UPDATE']);
  const { routes, sceneMap } = useMemo(() => createRoutesAndScenes(), []);

  return <Tab routes={routes} renderScene={sceneMap} />;
}

// #region TabHelpers
function createRoutesAndScenes() {
  const routes: { label: string; value: CollectionSlug }[] = [
    { label: 'Public', value: 'requests' },
    { label: 'Hospitals', value: 'hospitals' },
    { label: 'Milk Banks', value: 'milkBanks' },
  ];

  const scenes: Record<string, React.FC<SceneProps>> = {};

  const sceneRoutes: Route[] = routes.map(({ label, value }) => {
    if (value === 'donations' || value === 'requests') {
      scenes[value] = DonationRequestScene;
    } else if (value === 'hospitals' || value === 'milkBanks') {
      scenes[value] = OrganizationScene;
    }

    return {
      key: value,
      title: label,
      accessibilityLabel: label,
      testID: `available-${value}-tab`,
      accessible: true,
    };
  });

  return { routes: sceneRoutes, sceneMap: SceneMap(scenes) };
}
// #endregion
