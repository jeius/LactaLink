import { signOut } from '@/auth';
import { AnimatedPressable } from '@/components/animated/pressable';
import { ProfileAvatar } from '@/components/Avatar';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/auth/useAuth';
import { LOGO_ASSETS } from '@/lib/constants';
import { extractErrorMessage } from '@lactalink/utilities/errors';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import constants from 'expo-constants';
import { Link } from 'expo-router';
import { DoorOpenIcon, LogOutIcon } from 'lucide-react-native';
import React from 'react';
import { BackHandler } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { useTheme } from '../AppProvider/ThemeProvider';
import { Image } from '../Image';

export function NavigationDrawerContent(props: DrawerContentComponentProps) {
  const { themeColors } = useTheme();
  const { profileCollection } = useAuth();

  let filteredProps = props;

  if (profileCollection === 'individuals') {
    filteredProps = {
      ...props,
      state: {
        ...props.state,
        routeNames: props.state.routeNames.filter((routeName) => routeName !== 'Milk Inventory'),
        routes: props.state.routes.filter((route) => route.name !== 'inventory'),
      },
    };
  }

  return (
    <VStack className="flex-1">
      <DrawerHeader />
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <DrawerItemList {...filteredProps} />
        <DrawerItem
          label="Exit App"
          icon={({ color }) => <Icon as={DoorOpenIcon} color={color} />}
          labelStyle={{ fontFamily: 'Jakarta-SemiBold', fontSize: 14, lineHeight: 18 }}
          style={{ borderRadius: 14, height: 48 }}
          inactiveTintColor={themeColors.error[400]}
          onPress={() => BackHandler.exitApp()}
        />
      </ScrollView>
      <DrawerFooter />
    </VStack>
  );
}

function DrawerHeader() {
  const insets = useSafeAreaInsets();

  return (
    <HStack
      space="md"
      className="bg-primary-500 border-primary-300 items-center rounded-tr-2xl"
      style={{ paddingTop: insets.top, borderBottomWidth: 2 }}
    >
      <Image
        source={LOGO_ASSETS.logo_light}
        alt="LactaLink Logo"
        style={{ width: 96, height: 64, marginLeft: 8 }}
        contentFit="cover"
      />
    </HStack>
  );
}

function DrawerFooter() {
  const insets = useSafeAreaInsets();
  const { profile, user } = useAuth();
  const name =
    (profile && ('name' in profile ? profile.name : profile.displayName)) || 'Unknown User';
  const email = user?.email || 'No email provided';

  const appVersion = constants.expoConfig?.version || 'Unknown Version';

  function handleSignOut() {
    toast.promise(signOut(), {
      loading: 'Signing out...',
      success: (msg) => msg,
      error: (error) => extractErrorMessage(error),
    });
  }

  return (
    <VStack
      className="bg-primary-500 border-primary-300 items-center justify-start rounded-br-2xl border-t-2"
      style={{ paddingBottom: insets.bottom }}
    >
      <HStack className="w-full items-start justify-between">
        <Link href={'/profile'} asChild>
          <AnimatedPressable disableAnimation className="flex-1 shrink p-4">
            <HStack space="sm" className="items-center">
              <ProfileAvatar size="md" profile={profile} />
              <VStack className="min-w-0 flex-1">
                <Text
                  size="sm"
                  className="font-JakartaSemiBold text-primary-0"
                  ellipsizeMode="tail"
                  numberOfLines={1}
                >
                  {name}
                </Text>
                <Text size="xs" ellipsizeMode="tail" numberOfLines={1} className="text-primary-0">
                  {email}
                </Text>
              </VStack>
            </HStack>
          </AnimatedPressable>
        </Link>
        <AnimatedPressable className="p-4" onPress={handleSignOut}>
          <VStack space="xs" className="items-center">
            <Icon as={LogOutIcon} size="xl" className="text-primary-100" />
            <Text size="xs" className="text-primary-100 font-JakartaMedium">
              Logout
            </Text>
          </VStack>
        </AnimatedPressable>
      </HStack>

      <Text size="xs" className="text-primary-100 px-4">
        v{appVersion}
      </Text>
    </VStack>
  );
}
