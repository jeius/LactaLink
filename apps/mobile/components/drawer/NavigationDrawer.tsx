import LogoIcon from '@/assets/svgs/logo.svg';
import { signOut } from '@/auth';
import { AnimatedPressable } from '@/components/animated/pressable';
import { ProfileAvatar } from '@/components/Avatar';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/auth/useAuth';
import { getHexColor } from '@/lib/colors';
import { extractErrorMessage } from '@lactalink/utilities/errors';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { LogOutIcon } from 'lucide-react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { useTheme } from '../AppProvider/ThemeProvider';

export interface NavigationDrawerContentProps {
  state: unknown;
  navigation: unknown;
  descriptors: unknown;
}

export function NavigationDrawerContent(props: NavigationDrawerContentProps) {
  return (
    <VStack className="flex-1">
      <DrawerHeader />
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <DrawerFooter />
    </VStack>
  );
}

function DrawerHeader() {
  const insets = useSafeAreaInsets();

  const { theme } = useTheme();
  const logoColor = getHexColor(theme, 'primary', 0)?.toString();

  return (
    <HStack
      space="md"
      className="bg-primary-500 border-primary-300 items-center rounded-tr-xl"
      style={{ paddingTop: insets.top, borderBottomWidth: 2 }}
    >
      <LogoIcon width={96} height={64} fill={logoColor} />
    </HStack>
  );
}

function DrawerFooter() {
  const insets = useSafeAreaInsets();
  const { profile, user } = useAuth();
  const name =
    (profile && ('name' in profile ? profile.name : profile.displayName)) || 'Unknown User';
  const email = user?.email || 'No email provided';

  function handleSignOut() {
    toast.promise(signOut(), {
      loading: 'Signing out...',
      success: (msg) => msg,
      error: (error) => extractErrorMessage(error),
    });
  }

  return (
    <HStack
      className="bg-primary-500 border-primary-300 w-full items-start justify-between border-t-2"
      style={{ paddingBottom: insets.bottom }}
    >
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
      <AnimatedPressable className="p-4" onPress={handleSignOut}>
        <VStack space="xs" className="items-center">
          <Icon as={LogOutIcon} size="xl" className="text-primary-100" />
          <Text size="xs" className="text-primary-100 font-JakartaMedium">
            Logout
          </Text>
        </VStack>
      </AnimatedPressable>
    </HStack>
  );
}
