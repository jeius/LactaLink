import { Tab } from '@/components/tabs/Tab';
import { useLiveCollectionRevalidator } from '@/hooks/live-updates/useLiveCollectionRevalidator';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { Building2Icon, BuildingIcon, LucideProps, UsersIcon } from 'lucide-react-native';
import { FC, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { Route, SceneMap } from 'react-native-tab-view';
import { Icon } from '../ui/icon';
import { DonationRequestScene } from './scenes/DonationRequestScene';
import { OrganizationScene } from './scenes/OrganizationScene';
import { SceneProps } from './scenes/types';
import { TabBar } from './TabBar';

type RouteKey = Extract<CollectionSlug, 'donations' | 'hospitals' | 'milkBanks'>;

const iconMap: Record<RouteKey, FC<SvgProps | LucideProps>> = {
  donations: UsersIcon,
  hospitals: Building2Icon,
  milkBanks: BuildingIcon,
};

export function AvailableDonationsTab() {
  useLiveCollectionRevalidator('donations', ['UPDATE']);

  const { width } = useWindowDimensions();
  const { routes, sceneMap } = useMemo(() => createRoutesAndScenes(), []);

  return (
    <Tab
      routes={routes}
      renderScene={sceneMap}
      commonOptions={{
        icon: ({ color, route }) => (
          <Icon as={iconMap[route.key as RouteKey]} size="lg" color={color} />
        ),
      }}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          style={{ height: 54 }}
          tabStyle={{ width: width / 3 }}
          indicatorContainerStyle={{ height: 56 }}
        />
      )}
    />
  );
}

// #region TabHelpers
function createRoutesAndScenes() {
  const routes: { label: string; value: CollectionSlug }[] = [
    { label: 'Public', value: 'donations' },
    { label: 'Hospitals', value: 'hospitals' },
    { label: 'Milk Banks', value: 'milkBanks' },
  ];

  const scenes: Record<string, React.FC<SceneProps>> = {};

  const sceneRoutes: Route[] = routes.map(({ label, value }) => {
    if (value === 'donations') {
      scenes[value] = DonationRequestScene;
    } else if (value === 'hospitals' || value === 'milkBanks') {
      scenes[value] = OrgScene;
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

function OrgScene(props: SceneProps) {
  return <OrganizationScene {...props} actionCollection="requests" />;
}
