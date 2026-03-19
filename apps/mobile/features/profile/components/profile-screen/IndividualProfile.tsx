import { VerificationAlert } from '@/components/alerts/VerificationAlert';
import { AnimatedPressable } from '@/components/animated/pressable';
import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { BasicBadge } from '@/components/badges';
import { SingleImageViewer } from '@/components/ImageViewer';
import { Avatar, AvatarFallbackText } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { PROFILE_TYPE_ICONS } from '@/features/profile/lib/constants';
import { getColor } from '@/lib/colors';
import { Shade } from '@/lib/types/colors';
import { isMeUser } from '@/lib/utils/isMeUser';
import { createDirectionalShadow } from '@/lib/utils/shadows';
import { PopulatedUserProfile } from '@lactalink/types';
import { Individual } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractImageData } from '@lactalink/utilities/extractors';
import { Link } from 'expo-router';
import { BadgeCheckIcon, Edit2Icon } from 'lucide-react-native';
import ProfileCTA from './ProfileCTA';
import ProfileDetails from './ProfileDetails';
import ProfileFeatureCard from './ProfileFeatureCard';

interface IndividualProfileProps {
  profile: Extract<PopulatedUserProfile, { value: Individual }>;
}

export default function IndividualProfile({ profile }: IndividualProfileProps) {
  const user = extractCollection(profile.value.owner);
  const { themeColors } = useTheme();

  const isOwner = user && isMeUser(user);
  const isVerified = !!profile.value.isVerified;
  const isVerifiedDonor = false; //Mocked for now

  const name = profile.value.displayName || profile.value.givenName || 'Unknown User';

  const profileType = 'Individual';
  const profileIcon = PROFILE_TYPE_ICONS['INDIVIDUAL'];

  const getAccentColor = (shade: Shade) => {
    if (isVerifiedDonor) return themeColors.primary[shade];
    else if (isVerified) return themeColors.info[shade];
    return themeColors.background[shade];
  };

  const avatar = extractCollection(profile.value.avatar);
  const avatarImage = avatar ? extractImageData(avatar) : null;
  const avatarRingColor = getAccentColor(isVerified || isVerifiedDonor ? '500' : '0');
  const badgeIconFill = getAccentColor('500');
  const badgeIconStroke = getColor('background', '0');
  const bgGradientColors = [getAccentColor('50')!, getAccentColor('200')!] as const;
  const backgroundColor = getAccentColor('200');

  return (
    <VStack style={{ backgroundColor }}>
      <Box className="h-28 w-full p-2">
        <GradientBackground colors={bgGradientColors} />
      </Box>

      <VStack
        space="md"
        style={{
          ...createDirectionalShadow('top'),
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        className="relative bg-background-50 p-5"
      >
        <VStack className="items-center" style={{ marginTop: -60 }}>
          <Box className="relative h-24 w-24">
            <SingleImageViewer
              image={avatarImage}
              className="h-full w-full overflow-hidden rounded-full"
              style={{ borderColor: avatarRingColor, borderWidth: 3 }}
              fallback={
                <Avatar size="xl" className="self-center justify-self-center">
                  <AvatarFallbackText>{name}</AvatarFallbackText>
                </Avatar>
              }
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
          <Box className="absolute" style={{ top: 8, right: 8 }}>
            <Link href={`/profile/${profile.relationTo}/${profile.value.id}/edit`} asChild>
              <AnimatedPressable className="overflow-hidden rounded-full p-4">
                <Icon as={Edit2Icon} />
              </AnimatedPressable>
            </Link>
          </Box>
        )}

        {isOwner && !isVerified && <VerificationAlert />}

        {!isOwner && <ProfileCTA profile={profile} />}

        <ProfileDetails profile={profile} />

        <ProfileFeatureCard profile={profile} className="mt-2 p-2" />
      </VStack>
    </VStack>
  );
}
