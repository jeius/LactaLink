import { signOut } from '@/auth';
import { AnimatedPressable } from '@/components/animated/pressable';
import { ProfileAvatar } from '@/components/Avatar';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { LOGO_ASSETS } from '@/lib/constants';
import { extractCollection } from '@lactalink/utilities/extractors';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useLinkBuilder } from '@react-navigation/native';
import { Href, Link } from 'expo-router';
import { CompassIcon, DoorOpenIcon, LogOutIcon, LucideIcon } from 'lucide-react-native';
import { BackHandler } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from '../Image';
import DrawerItem from './DrawerItem';

export function NavigationDrawerContent(props: DrawerContentComponentProps) {
  const { buildHref } = useLinkBuilder();

  const { state, descriptors } = props;

  return (
    <VStack className="flex-1">
      <DrawerHeader />
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        {state.routes.map((route, i) => {
          const focused = i === state.index;

          const { title, drawerLabel, drawerIcon, drawerItemStyle } =
            descriptors[route.key]?.options || {};

          return (
            <DrawerItem
              key={route.key}
              href={buildHref(route.name, route.params) as Href | undefined}
              focused={focused}
              icon={drawerIcon as LucideIcon}
              style={drawerItemStyle}
              label={
                typeof drawerLabel === 'string'
                  ? drawerLabel
                  : title !== undefined
                    ? title
                    : route.name
              }
            />
          );
        })}

        <DrawerItem label="Explore" icon={CompassIcon} href={'/map'} />
        <DrawerItem
          label="Exit App"
          icon={DoorOpenIcon}
          action="negative"
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
      className="items-center rounded-tr-2xl border-primary-300 bg-primary-500"
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
  const { data: user } = useMeUser();
  const profile = extractCollection(user?.profile?.value);

  const name = profile?.displayName || 'Unknown User';
  const email = user?.email || 'No email provided';

  return (
    <VStack
      className="items-center justify-start rounded-br-2xl border-t-2 border-primary-300 bg-primary-500"
      style={{ paddingBottom: insets.bottom }}
    >
      <HStack className="w-full items-start justify-between">
        <Link href={'/account'} asChild>
          <AnimatedPressable disablePressAnimation className="flex-1 shrink p-4">
            <HStack space="sm" className="items-center">
              <ProfileAvatar size="md" profile={user?.profile ?? undefined} />
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
        <AnimatedPressable className="p-4" onPress={signOut}>
          <VStack space="xs" className="items-center">
            <Icon as={LogOutIcon} size="xl" className="text-primary-100" />
            <Text size="xs" className="font-JakartaMedium text-primary-100">
              Logout
            </Text>
          </VStack>
        </AnimatedPressable>
      </HStack>
    </VStack>
  );
}
