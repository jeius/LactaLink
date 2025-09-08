import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { ProfileAvatar } from '@/components/Avatar';
import { BasicBadge } from '@/components/badges';
import { IndividualDetails, OrganizationDetails } from '@/components/cards/ProfileCard';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { PROFILE_TYPE_ICONS } from '@/lib/constants/profile';
import { Shade } from '@/lib/types/colors';
import { shadow } from '@/lib/utils/shadows';
import { User } from '@lactalink/types';
import {
  capitalizeFirst,
  extractCollection,
  extractDefaultAddress,
  extractName,
  isHospital,
  isIndividual,
} from '@lactalink/utilities';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import {
  BadgeCheckIcon,
  EditIcon,
  HashIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  StethoscopeIcon,
} from 'lucide-react-native';
import React from 'react';

interface ProfileHeaderProps {
  user: User | null;
}
function ProfileHeader({ user }: ProfileHeaderProps) {
  const { themeColors } = useTheme();

  const profile = extractCollection(user?.profile?.value);

  const isVerified = true; //Mocked for now
  const isVerifiedDonor = false; //Mocked for now

  const name = profile?.displayName || (user && extractName(user)) || 'No name';
  const email = user?.email || 'No email';
  const phone = profile?.phone || 'No phone number';
  const fullAddress = extractDefaultAddress(user)?.displayName || 'No address';

  const hospitalHead = profile && isHospital(profile) ? profile.head : null;
  const hospitalID = profile && isHospital(profile) ? profile.hospitalID : null;

  const profileType = user?.profileType && capitalizeFirst(user.profileType.toLowerCase());
  const profileIcon =
    (user?.profileType && PROFILE_TYPE_ICONS[user.profileType]) || PROFILE_TYPE_ICONS.INDIVIDUAL;

  const avatarRingColor = getAccentColor(isVerified || isVerifiedDonor ? '500' : '0');
  const badgeIconFill = getAccentColor('500');
  const badgeIconStroke = themeColors.background[0];
  const bgGradientColors = [getAccentColor('50')!, getAccentColor('200')!] as const;
  const backgroundColor = getAccentColor('200');
  const sheetShadowColor = getAccentColor('900');

  function getAccentColor(shade: Shade) {
    if (isVerifiedDonor) {
      return themeColors.primary[shade];
    } else if (isVerified) {
      return themeColors.info[shade];
    }
    return themeColors.background[shade];
  }

  return (
    <VStack className="flex-col items-stretch" style={{ backgroundColor }}>
      <Box className="h-32 w-full flex-col items-end p-2">
        <GradientBackground colors={bgGradientColors} />

        <Button size="sm" variant="outline" action="default" className="mt-1 rounded-full">
          <ButtonIcon as={EditIcon} />
          <ButtonText>Edit Profile</ButtonText>
        </Button>
      </Box>
      <VStack
        space="md"
        style={{
          ...shadow.xl,
          shadowColor: sheetShadowColor,
        }}
        className="bg-background-50 grow items-stretch rounded-t-2xl p-5"
      >
        <VStack className="items-center" style={{ marginTop: -60 }}>
          <Box className="relative">
            <ProfileAvatar
              profile={profile}
              size="xl"
              style={{ borderColor: avatarRingColor, borderWidth: 3 }}
            />
            {(isVerified || isVerifiedDonor) && (
              <Box className="absolute bottom-0 right-0">
                <Icon
                  size="2xl"
                  as={BadgeCheckIcon}
                  fill={badgeIconFill}
                  stroke={badgeIconStroke}
                />
              </Box>
            )}
          </Box>

          <Text size="lg" className="font-JakartaSemiBold">
            {name}
          </Text>

          {(isVerified || isVerifiedDonor) && (
            <BasicBadge
              size="sm"
              text={isVerifiedDonor ? 'Verified Donor' : 'Verified User'}
              action={isVerifiedDonor ? 'primary' : 'info'}
              className="mt-1 py-0.5"
            />
          )}

          <HStack space="xs" className="mt-1 items-center">
            <Icon as={profileIcon} size="xs" />
            <Text italic size="sm" ellipsizeMode="tail" numberOfLines={1}>
              {profileType}
            </Text>
          </HStack>
        </VStack>

        <VStack space="sm" className="mt-1 items-stretch">
          {hospitalID && (
            <HStack space="sm" className="items-center">
              <Icon as={HashIcon} size="sm" />
              <Text size="sm" className="shrink" ellipsizeMode="tail" numberOfLines={1}>
                Hospital ID: {hospitalID}
              </Text>
            </HStack>
          )}
          {hospitalHead && (
            <HStack space="sm" className="items-center">
              <Icon as={StethoscopeIcon} size="sm" />
              <Text size="sm" className="shrink" ellipsizeMode="tail" numberOfLines={1}>
                Hospital Head: {hospitalHead}
              </Text>
            </HStack>
          )}

          <HStack space="sm" className="items-center">
            <Icon as={MailIcon} size="sm" />
            <Text size="sm" className="shrink" ellipsizeMode="tail" numberOfLines={1}>
              {email}
            </Text>
          </HStack>

          <HStack space="sm" className="items-center">
            <Icon as={PhoneIcon} size="sm" />
            <Text size="sm" className="shrink" ellipsizeMode="tail" numberOfLines={1}>
              {phone}
            </Text>
          </HStack>

          <HStack space="sm" className="items-start">
            <Icon as={MapPinIcon} size="sm" style={{ marginTop: 2 }} />
            <Text size="sm" className="shrink" ellipsizeMode="tail" numberOfLines={2}>
              {fullAddress}
            </Text>
          </HStack>
        </VStack>

        {profile &&
          (isIndividual(profile) ? (
            <IndividualDetails profile={profile} className="mt-2 p-2" />
          ) : (
            <OrganizationDetails profile={profile} className="mt-2 p-2" />
          ))}
      </VStack>
    </VStack>
  );
}

type Post = {
  id: string;
  title: string;
  content: string;
};

const samplePosts: Post[] = [
  {
    id: '1',
    title: 'My First Post',
    content:
      'This is the content of my first post. I am excited to share my thoughts and experiences with you all!',
  },
  {
    id: '2',
    title: 'A Day in the Life',
    content:
      'Today, I want to take you through a typical day in my life. From morning routines to evening reflections, here is how I spend my days.',
  },
  {
    id: '3',
    title: 'Travel Adventures',
    content:
      'Traveling is one of my passions. In this post, I will share some of my most memorable travel experiences and tips for fellow travelers.',
  },
];

export default function ProfilePage() {
  const { data: user, refetch: refetchUser, isRefetching } = useMeUser();

  const renderItem: ListRenderItem<Post> = ({ item }) => {
    const { title, content } = item;
    return (
      <Box className="bg-background-50 px-5 py-2">
        <Card>
          <VStack space="sm">
            <Text size="lg" className="font-JakartaSemiBold">
              {title}
            </Text>
            <Text size="md">{content}</Text>
          </VStack>
        </Card>
      </Box>
    );
  };

  function HeaderComponent() {
    return (
      <>
        <ProfileHeader user={user} />
        <Text size="lg" bold className="bg-background-50 px-5">
          Posts
        </Text>
      </>
    );
  }

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <FlashList
        data={samplePosts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchUser} />}
        ListHeaderComponent={HeaderComponent}
      />
    </SafeArea>
  );
}
