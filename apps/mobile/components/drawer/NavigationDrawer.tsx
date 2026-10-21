import { signOut } from '@/auth';
import { AnimatedPressable } from '@/components/animated/pressable';
import { ProfileAvatar } from '@/components/Avatar';
import { MilkBottleIcon } from '@/components/ui/icon/custom';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useProfileData } from '@/features/profile/hooks/useProfileData';
import { LOGO_ASSETS } from '@/lib/constants';
import { extractCollection } from '@lactalink/utilities/extractors';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Href, Link } from 'expo-router';
import {
  BadgeCheckIcon,
  BellIcon,
  Building2Icon,
  BuildingIcon,
  CircleHelpIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  CompassIcon,
  DoorOpenIcon,
  HandHeartIcon,
  HomeIcon,
  LogOutIcon,
  ListChecksIcon,
  MapPinIcon,
  MessageSquareIcon,
  PackageIcon,
  SettingsIcon,
  TruckIcon,
} from 'lucide-react-native';
import { BackHandler } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from '../Image';
import DrawerItem from './DrawerItem';

export function NavigationDrawerContent(props: DrawerContentComponentProps) {
  const { data: user } = useMeUser();
  const profileType = user?.profile?.relationTo;
  const isIndividual = profileType === 'individuals';

  const goHome = () => {
    props.navigation.navigate('(tabs)');
    props.navigation.closeDrawer();
  };

  return (
    <VStack className="flex-1 bg-background-0">
      <DrawerHeader />
      <ScrollView className="flex-1" contentContainerClassName="gap-1 p-4">
        <DrawerItem label="Home" icon={HomeIcon} focused onPress={goHome} />

        <MenuSection label="Milk Donation & Requests">
          <DrawerItem label="Available Listings" icon={MilkBottleIcon} href={'/listings'} />
          <DrawerItem label="Addresses" icon={MapPinIcon} href={'/account/addresses'} />
          {isIndividual ? (
            <>
              <DrawerItem
                label="Delivery Preferences"
                icon={ListChecksIcon}
                href={'/account/delivery-preferences'}
              />
              <DrawerItem label="My Donations" icon={HandHeartIcon} href={'/account/donations'} />
              <DrawerItem label="My Requests" icon={ClipboardListIcon} href={'/account/requests'} />
            </>
          ) : (
            <DrawerItem label="Inventory" icon={PackageIcon} href={'/account/inventory'} />
          )}
          <DrawerItem
            label="Incoming Donations"
            icon={HandHeartIcon}
            href={'/account/donations/incoming'}
          />
          <DrawerItem
            label="Incoming Requests"
            icon={ClipboardListIcon}
            href={'/account/requests/incoming'}
          />
          <DrawerItem label="Deliveries" icon={TruckIcon} href={'/account/deliveries'} />
          <DrawerItem
            label="Transactions"
            icon={ClipboardCheckIcon}
            href={'/account/transactions'}
          />
        </MenuSection>

        <MenuSection label="Network & Resources">
          <DrawerItem label="Hospitals" icon={Building2Icon} href={'/hospitals'} />
          <DrawerItem label="Milk Banks" icon={BuildingIcon} href={'/milk-banks'} />
          <DrawerItem label="Explore" icon={CompassIcon} href={'/map'} />
        </MenuSection>

        <MenuSection label="Communication">
          <DrawerItem label="Notifications" icon={BellIcon} href={'/notifications'} />
          <DrawerItem label="Messages" icon={MessageSquareIcon} href={'/messages'} />
        </MenuSection>

        <MenuSection label="Account & Safety">
          <DrawerItem label="Donor Screening" icon={BadgeCheckIcon} href={'/donor-screening'} />
          <DrawerItem label="ID Verification" icon={ClipboardCheckIcon} href={'/id-verification'} />
        </MenuSection>

        <Divider className="my-2" />
        <DrawerItem label="Settings" icon={SettingsIcon} href={'/account/settings'} />
        <DrawerItem label="Help & Support" icon={CircleHelpIcon} href={'/account'} />
        <DrawerItem
          label="Exit App"
          icon={DoorOpenIcon}
          action="negative"
          showChevron={false}
          onPress={() => BackHandler.exitApp()}
        />
      </ScrollView>
      <DrawerFooter />
    </VStack>
  );
}

function MenuSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <VStack className="mt-3 gap-1">
      <Text size="xs" className="px-3 uppercase tracking-widest text-typography-500">
        {label}
      </Text>
      {children}
      <Divider className="mt-2" />
    </VStack>
  );
}

function DrawerHeader() {
  const insets = useSafeAreaInsets();

  return (
    <HStack
      space="md"
      className="items-center rounded-tr-3xl border-primary-300 bg-primary-500 px-4"
      style={{ paddingTop: insets.top, borderBottomWidth: 2 }}
    >
      <Image
        source={LOGO_ASSETS.logo_light}
        alt="LactaLink Logo"
        style={{ width: 190, height: 104 }}
        contentFit="contain"
      />
    </HStack>
  );
}

function DrawerFooter() {
  const insets = useSafeAreaInsets();
  const { data: user } = useMeUser();
  const { data: populatedProfile } = useProfileData(user?.profile);
  const profile = populatedProfile?.value || extractCollection(user?.profile?.value);

  const name =
    profile?.displayName ||
    (profile && 'name' in profile ? profile.name : null) ||
    (profile && 'givenName' in profile ? profile.givenName : null) ||
    'Unknown User';
  const email = user?.email || 'No email provided';

  return (
    <VStack
      className="items-center justify-start rounded-br-3xl border-t border-primary-100 bg-primary-50"
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
                  className="font-JakartaSemiBold text-primary-900"
                  ellipsizeMode="tail"
                  numberOfLines={1}
                >
                  {name}
                </Text>
                <Text size="xs" ellipsizeMode="tail" numberOfLines={1} className="text-primary-700">
                  {email}
                </Text>
              </VStack>
            </HStack>
          </AnimatedPressable>
        </Link>
        <AnimatedPressable className="p-4" onPress={signOut}>
          <VStack space="xs" className="items-center">
            <Icon as={LogOutIcon} size="xl" className="text-error-600" />
            <Text size="xs" className="font-JakartaMedium text-error-600">
              Logout
            </Text>
          </VStack>
        </AnimatedPressable>
      </HStack>
    </VStack>
  );
}
