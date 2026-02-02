import { signOut } from '@/auth';
import { AnimatedPressable } from '@/components/animated/pressable';
import { useTheme } from '@/components/AppProvider/ThemeProvider';
import NumberBadge from '@/components/badges/NumberBadge';
import ProfileCard from '@/components/cards/ProfileCard';
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
import { BasicLocationPin, HandBottleIcon, MilkBottlePlus2Icon } from '@/components/ui/icon/custom';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  useInfiniteIncomingDonations,
  useInfiniteIncomingRequests,
} from '@/features/donation&request/hooks/queries';
import {
  useInfiniteDeliveries,
  useInfiniteTransactions,
} from '@/features/transactions/hooks/queries';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useRevalidateCollectionQueries } from '@/hooks/collections/useRevalidateQueries';
import { useLiveNotifications } from '@/hooks/live-updates/useLiveNotifications';
import { useNotification } from '@/hooks/notifications';
import { User } from '@lactalink/types/payload-generated-types';
import constants from 'expo-constants';
import { Href, Link, useRouter } from 'expo-router';
import {
  BellIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  IdCardIcon,
  LogOutIcon,
  LucideIcon,
  LucideProps,
  MessageSquareIcon,
  TruckIcon,
  UserRoundCheckIcon,
} from 'lucide-react-native';
import React, { FC, ReactNode } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { SvgProps } from 'react-native-svg';

export default function AccountPage() {
  useLiveNotifications();

  const router = useRouter();

  const { data: user = null, refetch, isRefetching, isLoading } = useMeUser();
  const revalidate = useRevalidateCollectionQueries();

  const actionLinks = createActionCardLinks(user);
  const deliveryLinks = createDeliveryLinks(user);
  const incomingLinks = createIncomingLinks(user);
  const otherLinks = createOtherLinks(user);

  const appVersion = constants.expoConfig?.version || 'Unknown Version';

  function handleRefetch() {
    refetch();
    revalidate(['donations', 'requests', 'transactions', 'notifications', 'identities']);
  }

  return (
    <SafeArea safeTop={false} className="items-stretch bg-background-0">
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefetch} />}
        className="flex-1"
        contentContainerClassName="grow flex-col items-stretch bg-background-50"
        showsVerticalScrollIndicator={false}
      >
        <VStack className="items-stretch">
          {user?.profile && (
            <Pressable className="p-5" onPress={() => router.push('/profile')}>
              <ProfileCard
                className="p-0"
                profile={user.profile}
                isLoading={isLoading}
                hideBadge
                disableNavigation
              />
            </Pressable>
          )}

          <HStack space="md" className="flex-wrap justify-center p-5">
            {actionLinks.map((link, i) => (
              <ActionCard key={i} {...link} />
            ))}
          </HStack>
        </VStack>

        <VStack
          space="sm"
          className="grow items-stretch border-outline-200 bg-background-0"
          style={{ borderTopWidth: 1 }}
        >
          <VStack className="grow">
            {incomingLinks.map((link, idx) => (
              <ActionLink key={idx} {...link} />
            ))}

            <Divider />

            {deliveryLinks.map((link, idx) => (
              <ActionLink key={idx} {...link} />
            ))}

            <Divider />

            {otherLinks.map((link, idx) => (
              <ActionLink key={idx} {...link} />
            ))}
          </VStack>

          <Button variant="outline" action="default" onPress={signOut} className="mx-5 mt-5">
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

interface ActionProps {
  icon: FC<LucideProps | SvgProps> | LucideIcon;
  href: Href;
  label: string;
  badge?: ReactNode;
}
function ActionCard({ icon, href, label }: ActionProps) {
  const { themeColors } = useTheme();
  const iconFillColor = themeColors.typography[900];

  return (
    <Link href={href} push asChild>
      <AnimatedPressable className="overflow-hidden rounded-2xl">
        <Card className="h-32 w-36">
          <VStack space="sm" className="flex-1 items-center">
            <Icon as={icon} size="2xl" fill={iconFillColor} />
            <Text size="sm" className="grow text-center align-middle font-JakartaMedium">
              {label}
            </Text>
          </VStack>
        </Card>
      </AnimatedPressable>
    </Link>
  );
}

function ActionLink({ icon, href, label, badge }: ActionProps) {
  const { themeColors } = useTheme();
  const iconFillColor = themeColors.typography[900];

  return (
    <Link href={href} push asChild>
      <AnimatedPressable disablePressAnimation>
        <HStack space="sm" className="w-full items-center justify-start px-5 py-4">
          <Icon as={icon} color={iconFillColor} />
          <Text className="grow font-JakartaMedium">{label}</Text>
          {badge}
          <Icon as={ChevronRightIcon} color={iconFillColor} />
        </HStack>
      </AnimatedPressable>
    </Link>
  );
}

function createActionCardLinks(user: User | null): ActionProps[] {
  if (!user) {
    return [];
  }

  const baseLinks: ActionProps[] = [
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

function createIncomingLinks(user: User | null): ActionProps[] {
  if (!user) {
    return [];
  }

  const baseLinks: ActionProps[] = [
    {
      icon: HandBottleIcon,
      href: '/account/donations/incoming',
      label: 'Incoming Donations',
      badge: <IncomingDonationsBadge />,
    },
    {
      icon: MilkBottlePlus2Icon,
      href: '/account/requests/incoming',
      label: 'Incoming Requests',
      badge: <IncomingRequestsBadge />,
    },
  ];

  return baseLinks;
}

function createDeliveryLinks(user: User | null): ActionProps[] {
  if (!user) {
    return [];
  }

  const baseLinks: ActionProps[] = [
    {
      icon: TruckIcon,
      href: '/account/deliveries',
      label: 'Deliveries',
      badge: <DeliveriesBadge />,
    },
    {
      icon: ClipboardListIcon,
      href: '/account/transactions',
      label: 'Transactions',
      badge: <TransactionBadge />,
    },
  ];

  return baseLinks;
}

function createOtherLinks(user: User | null): ActionProps[] {
  if (!user) {
    return [];
  }

  const baseLinks: ActionProps[] = [
    {
      icon: BellIcon,
      href: '/account/notifications',
      label: 'Notifications',
      badge: <NotificationBadge />,
    },
    {
      icon: MessageSquareIcon,
      href: '/chat',
      label: 'Messages',
    },
    {
      icon: UserRoundCheckIcon,
      href: '/donor-screening',
      label: 'Donor Screening',
    },
    {
      icon: IdCardIcon,
      href: '/id-verification',
      label: 'ID Verification',
    },
  ];

  return baseLinks;
}

function NotificationBadge() {
  const { unSeenCount } = useNotification();
  return <NumberBadge count={unSeenCount} />;
}

function TransactionBadge() {
  const { unseen, isLoading } = useInfiniteTransactions();
  if (isLoading) return <Spinner size={'small'} />;
  return <NumberBadge count={unseen.length} />;
}

function IncomingRequestsBadge() {
  const { data: meUser } = useMeUser();
  const { unreadCount, isLoading } = useInfiniteIncomingRequests(meUser);
  if (isLoading) return <Spinner size={'small'} />;
  return <NumberBadge count={unreadCount} />;
}

function IncomingDonationsBadge() {
  const { data: meUser } = useMeUser();
  const { unreadCount, isLoading } = useInfiniteIncomingDonations(meUser);
  if (isLoading) return <Spinner size={'small'} />;
  return <NumberBadge count={unreadCount} />;
}

function DeliveriesBadge() {
  const { unseen, isLoading } = useInfiniteDeliveries();
  if (isLoading) return <Spinner size={'small'} />;
  return <NumberBadge count={unseen.length} />;
}
