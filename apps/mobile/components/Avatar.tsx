import { useProfileData } from '@/features/profile/hooks/useProfileData';
import { useUserPresence } from '@/hooks/live-updates/useUserPresence';
import { isMeUser } from '@/lib/utils/isMeUser';
import { UserProfile } from '@lactalink/types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { useRecyclingState } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { AnimatedPressable } from './animated/pressable';
import * as UIAvatar from './ui/avatar';
import { Skeleton } from './ui/skeleton';

type AvatarProps = UIAvatar.AvatarProps & {
  showBadge?: boolean;
  status?: UIAvatar.AvatarBadgeProps['status'];
  onLoad?: () => void;
  fadeDuration?: number;
  profile?: UserProfile | null;
};

export default function Avatar({
  showBadge = false,
  status: badgeStatus = 'online',
  profile: profileProp,
  onLoad,
  fadeDuration,
  ...props
}: AvatarProps) {
  const { data, isLoading } = useProfileData(profileProp);
  const profile = data?.value;

  const avatar = extractCollection(profile?.avatar);
  const avatarName = profile?.displayName || 'User';

  let avatarUrl: string | null = avatar?.url || null;
  switch (props.size) {
    case 'xs':
      avatarUrl = avatar?.sizes?.icon?.url || avatarUrl;
      break;
    case 'sm':
    case 'md':
      avatarUrl = avatar?.sizes?.thumbnail?.url || avatarUrl;
      break;
    default:
      break;
  }

  return (
    <UIAvatar.Avatar {...props} status={badgeStatus}>
      {isLoading ? (
        <Skeleton className="flex-1" speed={4} variant="circular" />
      ) : (
        <>
          {avatarUrl ? (
            <UIAvatar.AvatarImage
              source={{ uri: avatarUrl }}
              alt={`Profile picture of ${avatarName}`}
              onLoad={onLoad}
              // fadeDuration={fadeDuration}
              transition={{ duration: fadeDuration, effect: 'cross-dissolve' }}
            />
          ) : (
            <UIAvatar.AvatarFallbackIcon />
          )}
          {showBadge && <UIAvatar.AvatarBadge status={badgeStatus} />}
        </>
      )}
    </UIAvatar.Avatar>
  );
}

interface ProfileAvatarProps extends AvatarProps {
  enablePress?: boolean;
  isLoading?: boolean;
}
export function ProfileAvatar({
  profile: profileProp,
  enablePress = false,
  showBadge = false,
  status,
  onLoad,
  fadeDuration,
  isLoading: isLoadingProp,
  ...props
}: ProfileAvatarProps) {
  const router = useRouter();

  const { data, ...query } = useProfileData(profileProp);
  const profile = data?.value;

  const presence = useUserPresence(profile?.owner);
  const badgeStatus = status ?? (presence?.isOnline ? 'online' : 'offline');

  const isLoading = isLoadingProp || query.isLoading;

  const avatar = extractCollection(profile?.avatar);

  const user = extractCollection(profile?.owner);
  const isOwner = !!(user && isMeUser(user));

  const profileSlug = profileProp?.relationTo;
  const profileID = extractID(profileProp?.value);

  const [isPressed, setIsPressed] = useRecyclingState(false, [profileID]);
  const avatarTintStyle = useAnimatedStyle(() => {
    const opacity = withTiming(isPressed ? 0.3 : 0, { duration: 150 });
    return { opacity };
  }, [isPressed]);

  const fallbackName = profile?.displayName || 'User';

  let avatarUrl: string | null = avatar?.url || null;

  switch (props.size) {
    case 'xs':
      avatarUrl = avatar?.sizes?.icon?.url || avatarUrl;
      break;
    case 'sm':
    case 'md':
      avatarUrl = avatar?.sizes?.thumbnail?.url || avatarUrl;
      break;
    default:
      break;
  }

  const handlePress = () => {
    if (!enablePress) return;
    if (isOwner) router.push('/account');
    else if (profileSlug && profileID) router.push(`/profile/${profileSlug}/${profileID}`);
  };

  return (
    <AnimatedPressable
      className="rounded-full"
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={handlePress}
      pointerEvents={enablePress ? 'auto' : 'none'}
    >
      <UIAvatar.Avatar
        {...props}
        className={`${props.className} ${isLoading ? 'bg-transparent' : ''}`}
      >
        {isLoading ? (
          <Skeleton speed={4} variant="circular" />
        ) : (
          <>
            {avatarUrl ? (
              <UIAvatar.AvatarImage
                source={{ uri: avatarUrl }}
                alt={`Profile picture of ${fallbackName}`}
                onLoad={onLoad}
                transition={{ duration: fadeDuration, effect: 'cross-dissolve' }}
              />
            ) : (
              <UIAvatar.AvatarFallbackText>{fallbackName}</UIAvatar.AvatarFallbackText>
            )}

            {showBadge && <UIAvatar.AvatarBadge status={badgeStatus} />}

            <Animated.View
              style={[StyleSheet.absoluteFillObject, avatarTintStyle]}
              className="bg-background-400"
            />
          </>
        )}
      </UIAvatar.Avatar>
    </AnimatedPressable>
  );
}
