import React, { FC, useMemo } from 'react';

import { Tab } from '@/components/tabs/Tab';
import { TabBar } from '@/components/tabs/TabBar';
import { BottomSheet, BottomSheetPortal } from '@/components/ui/bottom-sheet';
import { BottomSheetPortalProps, BottomSheetProps } from '@/components/ui/bottom-sheet/types';
import { BottomSheetHandle } from '@/components/ui/BottomSheetHandle';
import { Icon } from '@/components/ui/icon';
import { SceneProps } from '@/lib/types/tab-types';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { ListIcon, LucideProps, TruckIcon } from 'lucide-react-native';
import { useWindowDimensions } from 'react-native-keyboard-controller';
import { SvgProps } from 'react-native-svg';
import { Route, SceneMap } from 'react-native-tab-view';
import DeliveryScene from './DeliveryScene';
import DetailsScene from './DetailsScene';

interface TransactionSheetProps
  extends Pick<BottomSheetPortalProps, 'animatedPosition' | 'snapPoints'>,
    Pick<BottomSheetProps, 'snapToIndex'> {
  transaction: Transaction;
}

const routes = [
  { label: 'Delivery', value: 'delivery' },
  { label: 'Details', value: 'details' },
] as const;

type RouteKey = Extract<(typeof routes)[number]['value'], 'details' | 'delivery'>;

const iconMap: Record<RouteKey, FC<SvgProps | LucideProps>> = {
  details: ListIcon,
  delivery: TruckIcon,
};

export function TransactionSheet({ transaction, ...props }: TransactionSheetProps) {
  const { width } = useWindowDimensions();
  const { routes, sceneMap } = useMemo(() => createRoutesAndScenes(), []);

  return (
    <BottomSheet snapToIndex={props.snapToIndex} disableClose>
      <BottomSheetPortal
        {...props}
        handleComponent={BottomSheetHandle}
        enableContentPanningGesture={true}
        enableDynamicSizing={false}
        animateOnMount={true}
        backgroundStyle={{ backgroundColor: 'transparent' }}
        enableOverDrag={false}
      >
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
              tabStyle={{ width: width / 2 }}
              indicatorContainerStyle={{ height: 56 }}
            />
          )}
        />
      </BottomSheetPortal>
    </BottomSheet>
  );
}

function createRoutesAndScenes() {
  const scenes: Record<string, React.FC<SceneProps>> = {};

  const sceneRoutes: Route[] = routes.map(({ label, value }) => {
    switch (value) {
      case 'details':
        scenes[value] = DetailsScene;
        break;

      case 'delivery':
      default:
        scenes[value] = DeliveryScene;
        break;
    }

    return {
      key: value,
      title: label,
      accessibilityLabel: label,
      testID: `transaction-${value}-tab`,
      accessible: true,
    };
  });

  return { routes: sceneRoutes, sceneMap: SceneMap(scenes) };
}
