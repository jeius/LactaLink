import { VerificationAlert } from '@/components/alerts/VerificationAlert';
import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { ProfileAvatar } from '@/components/Avatar';
import { BasicBadge } from '@/components/badges';
import DonateMilkIcon from '@/components/icons/DonateMilkIcon';
import MilkBottlePlusIcon from '@/components/icons/MilkBottlePlusIcon';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { PROFILE_TYPE_ICONS } from '@/lib/constants/profile';
import { Shade } from '@/lib/types/colors';
import { RecipientSearchParams } from '@/lib/types/donationRequest';
import { isMeUser } from '@/lib/utils/isMeUser';
import { shadow } from '@/lib/utils/shadows';
import { Individual } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractDefaultAddress } from '@lactalink/utilities/extractors';
import { capitalizeFirst } from '@lactalink/utilities/formatters';
import { isIndividual } from '@lactalink/utilities/type-guards';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { BadgeCheckIcon, Edit2Icon, MailIcon, MapPinIcon, PhoneIcon } from 'lucide-react-native';
import { ComponentProps, useMemo } from 'react';

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

export default function IndividualProfilePage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: user, ...meUserQuery } = useMeUser();
  const meUserProfile = extractCollection(user?.profile?.value);

  const isMeUser = meUserProfile?.id === id;

  const { data: fetchedProfile, ...profileQuery } = useFetchById(!isMeUser, {
    collection: 'individuals',
    id,
  });

  const profile = isMeUser ? meUserProfile : fetchedProfile;
  const isRefetching = meUserQuery.isRefetching || profileQuery.isRefetching;
  const isLoading = meUserQuery.isLoading || profileQuery.isLoading;

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: 'Loading Profile...' }} />
        <LoadingSpinner />
      </>
    );
  }

  if (!profile || !isIndividual(profile)) return null;

  const name = profile.givenName;
  const headerTitle = isMeUser ? 'My Profile' : (name && `${name}'s Profile`) || 'Profile';

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

  function refresh() {
    meUserQuery.refetch();
    profileQuery.refetch();
  }

  function HeaderComponent() {
    if (!profile || !isIndividual(profile)) return null;

    if (isMeUser) {
      profile.owner = user;
    }

    return (
      <>
        <IndividualProfile profile={profile} />
        <Text size="lg" bold className="bg-background-50 px-5">
          Posts
        </Text>
      </>
    );
  }

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <Stack.Screen options={{ headerTitle }} />
      <FlashList
        data={samplePosts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refresh} />}
        ListHeaderComponent={HeaderComponent}
      />
    </SafeArea>
  );
}

//#region Components

interface IndividualProfileProps {
  profile: Individual;
}
function IndividualProfile({ profile }: IndividualProfileProps) {
  const { themeColors } = useTheme();

  const user = extractCollection(profile.owner);

  const isOwner = user && isMeUser(user);
  const isVerified = !!(profile && 'isVerified' in profile && profile.isVerified);
  const isVerifiedDonor = false; //Mocked for now

  const name = profile?.displayName || profile.givenName || 'Unknown User';
  const email = user?.email || 'No email';
  const phone = profile?.phone || 'No phone number';
  const fullAddress = extractDefaultAddress(user)?.displayName || 'No address';

  const profileType = 'Individual';
  const profileIcon = PROFILE_TYPE_ICONS['INDIVIDUAL'] || PROFILE_TYPE_ICONS.INDIVIDUAL;

  const params: RecipientSearchParams = {
    recipientID: profile.id,
    recipientSlug: user?.profile?.relationTo,
  };

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
      <Box className="h-28 w-full p-2">
        <GradientBackground colors={bgGradientColors} />
      </Box>

      <VStack
        space="md"
        style={{
          ...shadow.xl,
          shadowColor: sheetShadowColor,
        }}
        className="bg-background-50 relative grow items-stretch rounded-t-2xl p-5"
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

        {isOwner && (
          <Box className="absolute right-5 top-4">
            <Button variant="link" action="default" className="h-fit w-fit rounded-full p-2">
              <ButtonIcon as={Edit2Icon} />
            </Button>
          </Box>
        )}

        {isOwner && !isVerified && <VerificationAlert />}

        {!isOwner && (
          <HStack space="lg" className="w-full items-stretch justify-center">
            <Link asChild push href={{ pathname: `/donations/create`, params }}>
              <Button>
                <ButtonIcon as={DonateMilkIcon} fill={themeColors.primary[0]} />
                <ButtonText>Donate</ButtonText>
              </Button>
            </Link>
            <Link asChild push href={{ pathname: `/requests/create`, params }}>
              <Button variant="outline">
                <ButtonIcon as={MilkBottlePlusIcon} fill={themeColors.primary[500]} />
                <ButtonText>Request</ButtonText>
              </Button>
            </Link>
          </HStack>
        )}

        <VStack space="sm" className="mt-1 items-stretch">
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

        <IndividualDetails profile={profile} className="mt-2 p-2" />
      </VStack>
    </VStack>
  );
}

interface IndividualDetailsProps extends ComponentProps<typeof Card> {
  profile: Individual;
}
function IndividualDetails({ profile, ...props }: IndividualDetailsProps) {
  const individualDetails = useMemo(() => {
    if (!profile || !isIndividual(profile)) {
      return null;
    }

    const birthDate = new Date(profile.birth);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    const babies = profile.dependents || 0;
    const maritalStatus = capitalizeFirst(profile.maritalStatus.toLowerCase());
    return { age, babies, maritalStatus };
  }, [profile]);

  return (
    individualDetails && (
      <Card {...props}>
        <HStack space="sm" className="w-full items-stretch">
          <VStack space="sm" className="flex-1 items-center">
            <Text size="lg" bold>
              {individualDetails.babies}
            </Text>
            <Text size="sm">Dependents</Text>
          </VStack>
          <Divider orientation="vertical" />
          <VStack space="sm" className="flex-1 items-center">
            <Text size="lg" bold>
              {individualDetails.age}
            </Text>
            <Text size="sm">Age</Text>
          </VStack>
          <Divider orientation="vertical" />
          <VStack space="sm" className="flex-1 items-center justify-stretch">
            <Text size="sm" bold className="flex-1 text-center align-middle">
              {individualDetails.maritalStatus}
            </Text>
            <Text size="sm">Status</Text>
          </VStack>
        </HStack>
      </Card>
    )
  );
}

//#endregion
