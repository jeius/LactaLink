import { useAuth } from '@/hooks/auth/useAuth';
import { Avatar as AvatarType, User } from '@lactalink/types';
import { extractCollection } from '@lactalink/utilities';
import { Motion } from '@legendapp/motion';
import { Link } from 'expo-router';
import { ComponentProps, useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
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
  const { profile, isLoading } = useAuth();

  const avatar: AvatarType | null =
    (details ? details.avatar : (profile?.avatar as AvatarType | undefined)) || null;

  const avatarName =
    (details
      ? details.name
      : profile && ('name' in profile ? profile.name : profile.displayName)) || 'User';

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
  profile: User['profile'];
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
  const profile = extractCollection(profileProp?.value);
  const avatar: AvatarType | null = extractCollection(profile?.avatar);
  const [isPressed, setIsPressed] = useState(false);

  const fallbackName =
    (profile && ('name' in profile ? profile.name : profile.displayName)) || 'User';

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

  const AvatarComponent = useCallback(() => {
    return (
      <UIAvatar.Avatar
        {...props}
        style={[
          props.style,
          { overflow: 'hidden', backgroundColor: isLoading ? 'transparent' : undefined },
        ]}
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
            <Motion.View
              animate={{ opacity: isPressed ? 0.3 : 0 }}
              style={[StyleSheet.absoluteFill]}
              className="bg-background-400"
            />
          </>
        )}
      </UIAvatar.Avatar>
    );
  }, [
    isLoading,
    props,
    fallbackName,
    avatarUrl,
    onLoad,
    fadeDuration,
    showBadge,
    badgeStatus,
    isPressed,
  ]);

  return enablePress ? (
    <Link href={`/profile/${profile?.id}`} push asChild>
      <AnimatedPressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
      >
        <AvatarComponent />
      </AnimatedPressable>
    </Link>
  ) : (
    <AvatarComponent />
  );
}
