import { Tab } from '@/components/tabs/Tab';
import { useLiveCollectionRevalidator } from '@/hooks/live-updates/useLiveCollectionRevalidator';
import { CollectionSlug } from '@lactalink/types';
import { LucideProps } from 'lucide-react-native';
import { FC, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { Route, SceneMap } from 'react-native-tab-view';
import HospitalBuildingIcon from '../icons/HospitalBuildingIcon';
import MilkBankBuildingIcon from '../icons/MilkBankBuildingIcon';
import PeopleIcon from '../icons/PeopleIcon';
import { Icon } from '../ui/icon';
import { DonationRequestScene } from './scenes/DonationRequestScene';
import { OrganizationScene } from './scenes/OrganizationScene';
import { SceneProps } from './scenes/types';
import { TabBar } from './TabBar';

type RouteKey = Extract<CollectionSlug, 'donations' | 'hospitals' | 'milkBanks'>;

const iconMap: Record<RouteKey, FC<SvgProps | LucideProps>> = {
  donations: PeopleIcon,
  hospitals: HospitalBuildingIcon,
  milkBanks: MilkBankBuildingIcon,
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
          <Icon as={iconMap[route.key as RouteKey]} size="lg" fill={color} />
        ),
      }}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          style={{ height: 56 }}
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
