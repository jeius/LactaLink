import { Tabs } from 'expo-router';
import React from 'react';

export default function ExploreCardLayout() {
  return (
    <Tabs
      initialRouteName="(bottomsheet)"
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: 'transparent', pointerEvents: 'box-none' },
        tabBarStyle: { display: 'none' },
      }}
    />
  );
}
