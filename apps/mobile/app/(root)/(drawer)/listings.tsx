import DonateMilkIcon from '@/components/icons/DonateMilkIcon';
import MilkBottlePlusIcon from '@/components/icons/MilkBottlePlusIcon';
import SafeArea from '@/components/SafeArea';
import { DonationRequestScene } from '@/components/tabs/scenes/DonationRequestScene';
import { SceneProps } from '@/components/tabs/scenes/types';
import { Tab } from '@/components/tabs/Tab';
import { TabBar } from '@/components/tabs/TabBar';
import { Icon } from '@/components/ui/icon';
import { CollectionSlug } from '@lactalink/types';
import { LucideProps } from 'lucide-react-native';
import React, { FC, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { Route, SceneMap } from 'react-native-tab-view';

type RouteKey = Extract<CollectionSlug, 'donations' | 'requests'>;

const iconMap: Record<RouteKey, FC<SvgProps | LucideProps>> = {
  donations: DonateMilkIcon,
  requests: MilkBottlePlusIcon,
};

export default function ListingsPage() {
  const { width } = useWindowDimensions();
  const { routes, sceneMap } = useMemo(() => createRoutesAndScenes(), []);
  return (
    <SafeArea safeTop={false} className="items-stretch">
      <Tab
        routes={routes}
        renderScene={sceneMap}
        commonOptions={{
          icon: ({ color, route }) => (
            <Icon as={iconMap[route.key as RouteKey]} size="sm" fill={color} />
          ),
        }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={{ height: 54 }}
            tabStyle={{ width: width / 2 }}
            indicatorContainerStyle={{ height: 56 }}
          />
        )}
      />
    </SafeArea>
  );
}

function createRoutesAndScenes() {
  const routes: { label: string; value: CollectionSlug }[] = [
    { label: 'Donations', value: 'donations' },
    { label: 'Requests', value: 'requests' },
  ];

  const scenes: Record<string, React.FC<SceneProps>> = {};

  const sceneRoutes: Route[] = routes.map(({ label, value }) => {
    scenes[value] = DonationRequestScene;

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
