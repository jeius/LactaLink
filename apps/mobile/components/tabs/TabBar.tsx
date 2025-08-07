import { getHexColor } from '@/lib/colors';
import { TabBar as RNTabBar, Route, TabBarProps, TabDescriptor } from 'react-native-tab-view';
import { useTheme } from '../AppProvider/ThemeProvider';
import { Text } from '../ui/text';

export function TabBar<T extends Route>(props: TabBarProps<T>) {
  const { theme } = useTheme();
  const routes = props.navigationState.routes;
  const options: Record<string, TabDescriptor<T>> = {};

  routes.forEach((route) => {
    options[route.key] = {
      label: ({ color, labelText }) => (
        <Text className="font-JakartaMedium" style={{ color }}>
          {labelText}
        </Text>
      ),
    };
  });

  return (
    <RNTabBar
      {...props}
      indicatorStyle={{
        backgroundColor: getHexColor(theme, 'primary', 500),
      }}
      indicatorContainerStyle={{
        height: 50,
        backgroundColor: getHexColor(theme, 'background', 0),
      }}
      style={{
        height: 50,
        backgroundColor: getHexColor(theme, 'background', 50),
      }}
      contentContainerStyle={{
        backgroundColor: getHexColor(theme, 'background', 0),
      }}
      activeColor={getHexColor(theme, 'primary', 500)?.toString()}
      inactiveColor={getHexColor(theme, 'typography', 900)?.toString()}
      pressColor={getHexColor(theme, 'background', 100)?.toString()}
      options={options}
      scrollEnabled={props.scrollEnabled || true}
    />
  );
}
