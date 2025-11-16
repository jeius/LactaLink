import { useMeUser } from '@/hooks/auth/useAuth';
import { isMeUser } from '@/lib/utils/isMeUser';
import {
  Avatar as AvatarType,
  Hospital,
  Individual,
  MilkBank,
  User,
} from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { Link } from 'expo-router';
import { ComponentProps, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AnimatedPressable } from './animated/pressable';
import * as UIAvatar from './ui/avatar';
import { Skeleton } from './ui/skeleton';

type AvatarProps = ComponentProps<typeof UIAvatar.Avatar> & {
  showBadge?: boolean;
  status?: ComponentProps<typeof UIAvatar.AvatarBadge>['status'];
  details?: { avatar: AvatarType | null; name: string };
  onLoad?: () => void;
  fadeDuration?: number;
};

export default function Avatar({
  showBadge = false,
  status: badgeStatus,
  details,
  onLoad,
  fadeDuration,
  ...props
}: AvatarProps) {
  const { data: user, isLoading } = useMeUser();
  const profile = extractCollection(user?.profile?.value);

  const avatar = (details ? details.avatar : extractCollection(profile?.avatar)) || null;

  const avatarName = (details ? details.name : profile?.displayName) || 'User';

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
    <>
      {isLoading && <Skeleton className="h-12 w-12" speed={4} variant="circular" />}

      {!isLoading && (
        <UIAvatar.Avatar {...props}>
          <UIAvatar.AvatarFallbackText>{avatarName}</UIAvatar.AvatarFallbackText>
          {avatarUrl && (
            <UIAvatar.AvatarImage
              source={{ uri: avatarUrl }}
              alt={`Profile picture of ${avatarName}`}
              onLoad={onLoad}
              fadeDuration={fadeDuration}
            />
          )}
          {showBadge && <UIAvatar.AvatarBadge status={badgeStatus} />}
        </UIAvatar.Avatar>
      )}
    </>
  );
}

interface ProfileAvatarProps extends Omit<AvatarProps, 'details'> {
  profile?: User['profile'] | Individual | Hospital | MilkBank | null;
  enablePress?: boolean;
  isLoading?: boolean;
}
export function ProfileAvatar({
  profile: profileProp,
  enablePress = false,
  showBadge = false,
  status: badgeStatus,
  onLoad,
  fadeDuration,
  isLoading,
  ...props
}: ProfileAvatarProps) {
  const profile = extractCollection(
    profileProp && 'value' in profileProp ? profileProp?.value : profileProp
  );
  const avatar: AvatarType | null = extractCollection(profile?.avatar);

  const user = extractCollection(profile?.owner);
  const isOwner = !!(user && isMeUser(user));

  const profileSlug = user?.profile?.relationTo;
  const profileID = profile?.id;

  const pressed = useSharedValue(false);
  const avatarTintStyle = useAnimatedStyle(() => {
    const opacity = pressed.value ? 0.3 : 0;
    return {
      opacity: withTiming(opacity, { duration: 150 }),
    };
  });

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

  const AvatarComponent = () => (
    <UIAvatar.Avatar
      {...props}
      className={`${props.className} ${isLoading ? 'bg-transparent' : ''}`}
    >
      {isLoading ? (
        <Skeleton speed={4} variant="circular" />
      ) : (
        <>
          <UIAvatar.AvatarFallbackText>{fallbackName}</UIAvatar.AvatarFallbackText>
          {avatarUrl && (
            <UIAvatar.AvatarImage
              source={{ uri: avatarUrl }}
              alt={`Profile picture of ${fallbackName}`}
              onLoad={onLoad}
              fadeDuration={fadeDuration}
            />
          )}
          {showBadge && <UIAvatar.AvatarBadge status={badgeStatus} />}
          <Animated.View
            style={[StyleSheet.absoluteFill, avatarTintStyle]}
            className="bg-background-400"
          />
        </>
      )}
    </UIAvatar.Avatar>
  );

  useEffect(() => {
    pressed.value = false;
  }, [profileID, pressed]);

  return enablePress ? (
    profileSlug && profileID && (
      <Link href={isOwner ? '/account' : `/profile/${profileSlug}/${profileID}`} push asChild>
        <AnimatedPressable
          className="overflow-hidden rounded-full"
          onPressIn={() => {
            pressed.value = true;
          }}
          onPressOut={() => {
            pressed.value = false;
          }}
        >
          <AvatarComponent />
        </AnimatedPressable>
      </Link>
    )
  ) : (
    <AvatarComponent />
  );
}
