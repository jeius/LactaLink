import { ProfileAvatar } from '@/components/Avatar';
import { useHeaderActions, useHeaderProgress } from '@/components/contexts/HeaderProvider';
import { Header, HeaderProps } from '@/components/Header';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { useMeUser } from '@/hooks/auth/useAuth';
import { DrawerActions } from '@react-navigation/native';
import { Link, useNavigation } from 'expo-router';
import { MenuIcon, SearchIcon } from 'lucide-react-native';
import React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { HStack } from '../ui/hstack';

const AnimatedHeader = Animated.createAnimatedComponent(Header);

interface DrawerHeaderProps extends Pick<HeaderProps, 'hideShadow'> {
  title: string;
  showSearch?: boolean;
}

export function DrawerHeader({ title, showSearch = false, ...props }: DrawerHeaderProps) {
  const { data: user } = useMeUser();
  const profile = user?.profile;

  const { setSize } = useHeaderActions();
  const { translateY } = useHeaderProgress();

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const navigation = useNavigation();

  function openDrawer() {
    navigation.dispatch(DrawerActions.openDrawer());
  }

  return (
    <AnimatedHeader
      {...props}
      title={title}
      style={animatedHeaderStyle}
      onLayout={(e) => setSize(e.nativeEvent.layout)}
      headerRight={({ tintColor }) => (
        <HStack space="sm" className="items-center">
          {showSearch && <SearchButton tintColor={tintColor} />}
          <ProfileAvatar size="sm" profile={profile ?? undefined} enablePress />
        </HStack>
      )}
      headerLeft={({ tintColor }) => (
        <Pressable className="overflow-hidden rounded-lg p-2" hitSlop={8} onPress={openDrawer}>
          <Icon as={MenuIcon} size="xl" color={tintColor} />
        </Pressable>
      )}
    />
  );
}

function SearchButton({ tintColor }: { tintColor?: string }) {
  return (
    <Link asChild push href={'/search'}>
      <Pressable className="overflow-hidden rounded-full p-2">
        <Icon as={SearchIcon} color={tintColor} size="xl" />
      </Pressable>
    </Link>
  );
}
