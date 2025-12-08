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
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import PostItem from '@/features/feed/components/post-item/PostItem';
import PostPlaceholderItem from '@/features/feed/components/post-item/PostPlaceholderItem';
import ProfileDetails from '@/features/profile/components/ProfileDetails';
import { useInfiniteUserPosts } from '@/features/profile/hooks/queries';
import { useProfileData } from '@/features/profile/hooks/useProfileData';
import { PROFILE_TYPE_ICONS } from '@/features/profile/lib/constants';
import { useMeUser } from '@/hooks/auth/useAuth';
import { Shade } from '@/lib/types/colors';
import { RecipientSearchParams } from '@/lib/types/donationRequest';
import { isMeUser } from '@/lib/utils/isMeUser';
import { shadow } from '@/lib/utils/shadows';
import { Individual, Post } from '@lactalink/types/payload-generated-types';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import {
  extractCollection,
  extractDefaultAddress,
  extractID,
  listKeyExtractor,
} from '@lactalink/utilities/extractors';
import { isIndividual } from '@lactalink/utilities/type-guards';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { BadgeCheckIcon, Edit2Icon, MailIcon, MapPinIcon, PhoneIcon } from 'lucide-react-native';
import { useCallback } from 'react';

export default function IndividualProfilePage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: user, ...meUserQuery } = useMeUser();
  const isMeUser = extractID(user?.profile?.value) === id;

  const { data: profile, ...profileQuery } = useProfileData(
    isMeUser
      ? user?.profile!
      : {
          relationTo: 'individuals',
          value: id,
        }
  );

  const isRefetching = profileQuery.isRefetching;
  const isLoading = profileQuery.isLoading;

  const refresh = useCallback(() => {
    meUserQuery.refetch();
    profileQuery.refetch();
  }, [meUserQuery, profileQuery]);

  if (isLoading || !profile) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: 'Loading Profile...' }} />
        <LoadingSpinner />
      </>
    );
  }

  if (!isIndividual(profile)) return null;

  const headerTitle = isMeUser ? 'My Profile' : profile.displayName || 'Profile';

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <Stack.Screen options={{ headerTitle }} />
      <PostList profile={profile} isRefreshing={isRefetching} onRefresh={refresh} />
    </SafeArea>
  );
}

//#region Components
interface PostListProps {
  profile: Individual;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

function PostList({ profile, isRefreshing, onRefresh }: PostListProps) {
  const { data: posts, ...postsQuery } = useInfiniteUserPosts({
    relationTo: 'individuals',
    value: profile,
  });
  const router = useRouter();

  const renderItem: ListRenderItem<Post> = ({ item }) => {
    if (isPlaceHolderData(item)) return <PostPlaceholderItem />;

    const handlePress = () => router.push(`/feed/${item.id}`);
    return <PostItem post={item} onPress={handlePress} />;
  };

  const HeaderComponent = () => {
    return (
      <>
        <IndividualProfile profile={profile} />
        <Text size="xl" bold className="bg-background-50 px-4 py-2">
          Posts
        </Text>
      </>
    );
  };

  return (
    <FlashList
      data={posts}
      renderItem={renderItem}
      keyExtractor={listKeyExtractor}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={HeaderComponent}
      ListEmptyComponent={ListEmpty}
      ListFooterComponent={() =>
        postsQuery.isFetchingNextPage && <Spinner size={'small'} className="my-4" />
      }
      contentContainerStyle={{ paddingBottom: 16 }}
      ItemSeparatorComponent={() => <Box className="h-1" />}
      refreshControl={<RefreshControl refreshing={isRefreshing ?? false} onRefresh={onRefresh} />}
      onEndReached={postsQuery.fetchNextPage}
      onEndReachedThreshold={0.25}
    />
  );
}

function ListEmpty() {
  return (
    <VStack space="lg" className="items-center justify-center p-5">
      <Text size="lg" className="mt-10 text-typography-700">
        No posts yet. Share one!
      </Text>
      <Link asChild push href={{ pathname: '/feed/create' }}>
        <Button>
          <ButtonText>Create Post</ButtonText>
        </Button>
      </Link>
    </VStack>
  );
}

function IndividualProfile({ profile }: { profile: Individual }) {
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
    rid: profile.id,
    rslg: user?.profile?.relationTo,
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
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        className="relative grow items-stretch bg-background-50 p-5"
      >
        <VStack className="items-center" style={{ marginTop: -60 }}>
          <Box className="relative">
            <ProfileAvatar
              profile={{ relationTo: 'individuals', value: profile }}
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

        <ProfileDetails
          profile={{ relationTo: 'individuals', value: profile }}
          className="mt-2 p-2"
        />
      </VStack>
    </VStack>
  );
}

//#endregion
