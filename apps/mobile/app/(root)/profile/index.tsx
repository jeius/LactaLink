import { AnimatedPressable } from '@/components/animated/pressable';
import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { ProfileAvatar } from '@/components/Avatar';
import BasicLocationPin from '@/components/icons/BasicLocationPin';
import DonateMilkIcon from '@/components/icons/DonateMilkIcon';
import InTransitIcon from '@/components/icons/InTransitIcon';
import InventoryIcon from '@/components/icons/InventoryIcon';
import MilkBottlePlusIcon from '@/components/icons/MilkBottlePlusIcon';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { PROFILE_TYPE_ICONS } from '@/lib/constants/profile';
import { User } from '@lactalink/types';
import { capitalizeFirst, extractCollection } from '@lactalink/utilities';
import { Href, Link } from 'expo-router';
import { EditIcon, LucideIcon, LucideProps, MailIcon, PhoneIcon } from 'lucide-react-native';
import React, { FC } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { SvgProps } from 'react-native-svg';

export default function ProfilePage() {
  const { themeColors } = useTheme();

  const { data: user, refetch: refetchUser, isRefetching } = useMeUser();
  const profile = extractCollection(user?.profile?.value);

  const name = (profile && ('name' in profile ? profile.name : profile.displayName)) || 'No name';
  const email = user?.email || 'No email';
  const phone = user?.phone || 'No phone number';
  const profileType = user?.profileType && capitalizeFirst(user.profileType.toLowerCase());
  const profileIcon =
    (user?.profileType && PROFILE_TYPE_ICONS[user.profileType]) || PROFILE_TYPE_ICONS.INDIVIDUAL;

  const actionLinks = createActionLinks(user);

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchUser} />}
        contentContainerClassName="p-5 flex-col items-center gap-8"
      >
        <HStack space="lg" className="w-full">
          <VStack space="sm" className="items-center">
            <ProfileAvatar profile={profile} size="xl" />
            {profileType && (
              <HStack space="xs" className="items-center">
                <Icon as={profileIcon} size="xs" fill={themeColors.typography[600]} />
                <Text size="xs" className="text-typography-600 text-center">
                  {profileType}
                </Text>
              </HStack>
            )}
          </VStack>

          <VStack space="sm" className="items-stretch">
            <Text className="font-JakartaSemiBold">{name}</Text>
            <HStack space="sm" className="items-center">
              <Icon as={MailIcon} size="lg" />
              <Text size="sm">{email}</Text>
            </HStack>

            <HStack space="sm" className="items-center">
              <Icon as={PhoneIcon} size="lg" />
              <Text size="sm">{phone}</Text>
            </HStack>

            <Button size="sm" variant="outline" action="default" className="mt-2 rounded-full">
              <ButtonIcon as={EditIcon} />
              <ButtonText>Edit Profile</ButtonText>
            </Button>
          </VStack>
        </HStack>

        <HStack space="lg" className="flex-wrap items-center justify-center">
          {actionLinks.map((link, index) => (
            <ProfileActionLinkCard {...link} key={index} />
          ))}
        </HStack>
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

function createActionLinks(user: User | null): ProfileActionLinkCardProps[] {
  if (!user) {
    return [];
  }

  const params = { userID: user.id };

  const baseLinks: ProfileActionLinkCardProps[] = [
    {
      icon: BasicLocationPin,
      href: '/profile/addresses',
      label: 'Addresses',
    },
  ];

  if (user.profileType === 'INDIVIDUAL') {
    baseLinks.push(
      {
        icon: InTransitIcon,
        href: '/profile/delivery-preferences',
        label: 'Delivery Preferences',
      },
      {
        icon: DonateMilkIcon,
        href: { pathname: '/profile/donations', params },
        label: 'My Donations',
      },
      {
        icon: MilkBottlePlusIcon,
        href: { pathname: '/profile/requests', params },
        label: 'My requests',
      }
    );
  } else {
    baseLinks.push({
      icon: InventoryIcon,
      href: '/inventory',
      label: 'Inventory',
    });
  }

  return baseLinks;
}
