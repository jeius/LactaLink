import { RIPPLE_COLOR } from '@/lib/colors';
import { TabBar as RNTabBar, Route, TabBarProps } from 'react-native-tab-view';
import { useTheme } from '../AppProvider/ThemeProvider';
import { Text } from '../ui/text';

export function TabBar<T extends Route>(props: TabBarProps<T>) {
  const { themeColors } = useTheme();
  const activeTintColor = themeColors.primary[500]?.toString();
  const inActiveTintColor = themeColors.typography[900]?.toString();
  const pressColor = themeColors.background[100]?.toString();
  const bgColor = themeColors.background[50]?.toString();
  const cardBgColor = themeColors.background[0]?.toString();

  const routes = props.navigationState.routes;
  const options = { ...props.options };

  routes.forEach((route) => {
    options[route.key] = {
      ...options[route.key],
      label: ({ color, labelText, style }) => (
        <Text className="text-center font-JakartaSemiBold" size="sm" style={[{ color }, style]}>
          {labelText}
        </Text>
      ),
    };
  });

  return (
    <RNTabBar
      {...props}
      indicatorStyle={[{ backgroundColor: activeTintColor }, props.indicatorStyle]}
      indicatorContainerStyle={[
        { height: 50, backgroundColor: cardBgColor },
        props.indicatorContainerStyle,
      ]}
      style={[{ height: 50, backgroundColor: bgColor }, props.style]}
      contentContainerStyle={[{ backgroundColor: cardBgColor }, props.contentContainerStyle]}
      activeColor={activeTintColor}
      inactiveColor={inActiveTintColor}
      pressColor={pressColor}
      options={options}
      scrollEnabled={props.scrollEnabled || true}
      android_ripple={{ color: RIPPLE_COLOR, foreground: true }}
    />
  );
}
