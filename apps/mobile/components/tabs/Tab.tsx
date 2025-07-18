import { useState } from 'react';
import { useWindowDimensions } from 'react-native';

import { getHexColor } from '@/lib/colors';
import { Route, TabView, TabViewProps } from 'react-native-tab-view';
import { useTheme } from '../AppProvider/ThemeProvider';
import { TabBar } from './TabBar';

interface TabProps<T extends Route>
  extends Omit<TabViewProps<T>, 'onIndexChange' | 'navigationState'> {
  routes: T[];
  onIndexChange?: (index: number) => void;
}
export function Tab<T extends Route>({
  renderTabBar = TabBar,
  routes,
  onIndexChange,
  ...props
}: TabProps<T>) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  function handleIndexChange(index: number) {
    setIndex(index);
    onIndexChange?.(index);
  }

  return (
    <TabView
      {...props}
      navigationState={{ index, routes }}
      onIndexChange={handleIndexChange}
      initialLayout={props.initialLayout || { width }}
      renderTabBar={renderTabBar}
      pagerStyle={[{ backgroundColor: getHexColor(theme, 'background', 50) }, props.pagerStyle]}
    />
  );
}
