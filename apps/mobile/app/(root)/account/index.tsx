import { signOut } from '@/auth';
import { AnimatedPressable } from '@/components/animated/pressable';
import { useTheme } from '@/components/AppProvider/ThemeProvider';
import ProfileCard from '@/components/cards/ProfileCard';
import BasicLocationPin from '@/components/icons/BasicLocationPin';
import DonateMilkIcon from '@/components/icons/DonateMilkIcon';
import InTransitIcon from '@/components/icons/InTransitIcon';
import InventoryIcon from '@/components/icons/InventoryIcon';
import MilkBottlePlusIcon from '@/components/icons/MilkBottlePlusIcon';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { User } from '@lactalink/types';
import constants from 'expo-constants';
import { Href, Link } from 'expo-router';
import {
  BellIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  HandHeartIcon,
  LogOutIcon,
  LucideIcon,
  LucideProps,
  PackagePlusIcon,
  TruckIcon,
} from 'lucide-react-native';
import React, { FC, Fragment } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { SvgProps } from 'react-native-svg';

export default function ProfilePage() {
  const { data: user, refetch, isRefetching, isLoading } = useMeUser();

  const actionLinks = createActionLinks(user);
  const quickLinks = createQuickActionLinks(user);

  const appVersion = constants.expoConfig?.version || 'Unknown Version';

  return (
    <SafeArea safeTop={false} className="bg-background-0 items-stretch">
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        className="flex-1"
        contentContainerClassName="grow flex-col items-stretch bg-background-50"
      >
        <VStack>
          <ProfileCard className="p-5" profile={user?.profile} isLoading={isLoading} />

          <HStack space="md" className="mb-5 flex-wrap justify-center px-5">
            {actionLinks.map((link, i) => (
              <ProfileActionLinkCard key={i} {...link} />
            ))}
          </HStack>
        </VStack>

        <VStack space="sm" className="bg-background-0 grow items-stretch p-5 pb-2">
          <VStack className="grow">
            <Text size="lg" bold className="mb-1">
              Quick Actions
            </Text>

            {quickLinks.map((link, idx) => {
              const isLast = idx === quickLinks.length - 1;
              return (
                <Fragment key={idx}>
                  <QuickActionItem key={idx} {...link} />
                  {!isLast && <Divider />}
                </Fragment>
              );
            })}
          </VStack>

          <Button variant="outline" action="default" onPress={signOut}>
            <ButtonIcon as={LogOutIcon} />
            <ButtonText>Logout</ButtonText>
          </Button>
          <Text size="sm" className="text-center">
            Version: {appVersion}
          </Text>
        </VStack>
      </ScrollView>
    </SafeArea>
  );
}

interface ProfileActionLinkCardProps {
  icon: FC<LucideProps | SvgProps> | LucideIcon;
  href: Href;
  label: string;
}
function ProfileActionLinkCard({ icon, href, label }: ProfileActionLinkCardProps) {
  const { themeColors } = useTheme();
  const iconFillColor = themeColors.typography[900];

  return (
    <Link href={href} push asChild>
      <AnimatedPressable className="overflow-hidden rounded-2xl">
        <Card className="h-32 w-36">
          <VStack space="sm" className="flex-1 items-center">
            <Icon as={icon} size="2xl" fill={iconFillColor} />
            <Text size="sm" className="font-JakartaMedium grow text-center align-middle">
              {label}
            </Text>
          </VStack>
        </Card>
      </AnimatedPressable>
    </Link>
  );
}

function QuickActionItem({ icon, href, label }: ProfileActionLinkCardProps) {
  const { themeColors } = useTheme();
  const iconFillColor = themeColors.typography[900];

  return (
    <Link href={href} push asChild>
      <AnimatedPressable disableAnimation>
        <HStack space="sm" className="w-full items-center justify-start py-5">
          <Icon as={icon} color={iconFillColor} />
          <Text className="font-JakartaMedium grow">{label}</Text>
          <Icon as={ChevronRightIcon} color={iconFillColor} />
        </HStack>
      </AnimatedPressable>
    </Link>
  );
}

function createActionLinks(user: User | null): ProfileActionLinkCardProps[] {
  if (!user) {
    return [];
  }

  const baseLinks: ProfileActionLinkCardProps[] = [
    {
      icon: BasicLocationPin,
      href: '/account/addresses',
      label: 'Addresses',
    },
  ];

  if (user.profileType === 'INDIVIDUAL') {
    baseLinks.push(
      {
        icon: InTransitIcon,
        href: '/account/delivery-preferences',
        label: 'Delivery Preferences',
      },
      {
        icon: DonateMilkIcon,
        href: '/account/donations',
        label: 'My Donations',
      },
      {
        icon: MilkBottlePlusIcon,
        href: '/account/requests',
        label: 'My Requests',
      }
    );
  } else {
    baseLinks.push({
      icon: InventoryIcon,
      href: '/account/inventory',
      label: 'Inventory',
    });
  }

  return baseLinks;
}

function createQuickActionLinks(user: User | null): ProfileActionLinkCardProps[] {
  if (!user) {
    return [];
  }

  const baseLinks: ProfileActionLinkCardProps[] = [
    {
      icon: HandHeartIcon,
      href: '/account/donations',
      label: 'Incoming Donations',
    },
    {
      icon: PackagePlusIcon,
      href: '/account/requests',
      label: 'Incoming Requests',
    },
    {
      icon: BellIcon,
      href: '/account/notifications',
      label: 'Notifications',
    },
    {
      icon: TruckIcon,
      href: '/account/deliveries',
      label: 'Deliveries',
    },
    {
      icon: ClipboardListIcon,
      href: '/account/transactions',
      label: 'Transactions',
    },
  ];

  return baseLinks;
}
