import { useTheme } from '@/components/AppProvider/ThemeProvider';
import Map from '@/components/map';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { getHexColor } from '@/lib/colors';
import { MapPageSearchParams } from '@/lib/types';
import { Tabs, useLocalSearchParams } from 'expo-router';
import { CompassIcon, MapIcon } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

export default function Layout() {
  const { theme } = useTheme();
  const tabBarActiveTintColor = getHexColor(theme, 'primary', 500)?.toString();
  const tabBarInactiveTintColor = getHexColor(theme, 'typography', 900)?.toString();
  const tabBarBackgroundColor = getHexColor(theme, 'background', 0)?.toString();
  const rippleColor = getHexColor(theme, 'background', 100)?.toString();
  const borderColor = getHexColor(theme, 'outline', 600)?.toString();

  const { markerID } = useLocalSearchParams<MapPageSearchParams>();

  return (
    <Box className="relative flex-1">
      <Map style={StyleSheet.absoluteFill} selectedMarkerID={markerID} />
      <Tabs
        initialRouteName="explore"
        screenOptions={{
          animation: 'shift',
          headerShown: false,
          sceneStyle: { backgroundColor: 'transparent', pointerEvents: 'box-none' },
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor,
          tabBarInactiveTintColor,
          tabBarStyle: { backgroundColor: tabBarBackgroundColor, elevation: 0, borderColor },
          tabBarLabelStyle: { fontSize: 12, fontFamily: 'Jakarta-SemiBold' },
          tabBarLabelPosition: 'beside-icon',
          tabBarButton: (props) => (
            <Pressable {...props} android_ripple={{ radius: 100, color: rippleColor }} />
          ),
        }}
      >
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <Icon as={CompassIcon} color={color} size="lg" />,
            tabBarLabel: 'Explore',
          }}
        />
        <Tabs.Screen
          name="directions"
          options={{
            title: 'Directions',
            tabBarIcon: ({ color }) => <Icon as={MapIcon} color={color} size="lg" />,
            tabBarLabel: 'Directions',
          }}
        />
      </Tabs>
    </Box>
  );
}
