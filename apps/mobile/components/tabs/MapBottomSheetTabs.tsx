import { CollectionSlug, Donation, Request } from '@lactalink/types';
import { Route, SceneMap } from 'react-native-tab-view';

import { createMarkerID, useMarkersStore } from '@/lib/stores/markersStore';
import { extractCollection, isDonation, validatePoint } from '@lactalink/utilities';
import React, { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useMap } from '../contexts/MapProvider';
import { DonationRequestScene } from './scenes/DonationRequestScene';
import { SceneProps } from './scenes/types';
import { Tab } from './Tab';
import { TabBar } from './TabBar';

export function MapBottomSheetTabs() {
  const { routes, sceneMap } = useMemo(() => createRoutesAndScenes(), []);
  const { width } = useWindowDimensions();
  return (
    <Tab
      routes={routes}
      renderScene={sceneMap}
      renderTabBar={(props) => (
        <TabBar {...props} tabStyle={{ width: width / 2 }} scrollEnabled={false} />
      )}
    />
  );
}

// #region TabHelpers
function createRoutesAndScenes() {
  const routes: { label: string; value: CollectionSlug }[] = [
    { label: 'Donations', value: 'donations' },
    { label: 'Requests', value: 'requests' },
  ];

  const scenes: Record<string, React.FC<SceneProps>> = {};

  const sceneRoutes: Route[] = routes.map(({ label, value }) => {
    scenes[value] = DonReqScene;

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

function DonReqScene(props: SceneProps) {
  const { setSelectedMarker } = useMap();
  const { markerMap } = useMarkersStore();

  function handlePress(data: Donation | Request) {
    const deliveryPreference = extractCollection(data.deliveryPreferences)?.[0];
    const address = extractCollection(deliveryPreference?.address);
    const coordinates = address?.coordinates;

    if (validatePoint(coordinates)) {
      const slug = isDonation(data) ? 'donations' : 'requests';
      const markerID = createMarkerID(slug, data.id, coordinates);
      const markerData = markerMap.get(markerID);

      if (markerData) {
        setSelectedMarker(markerData);
      } else {
        console.warn(`Marker data not found for ID: ${markerID}`);
      }
    }
  }

  return <DonationRequestScene {...props} onPress={handlePress} useBottomSheetList={true} />;
}
