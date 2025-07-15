import { useAuth } from '@/hooks/auth/useAuth';
import { Avatar as AvatarType } from '@lactalink/types';
import { ComponentProps } from 'react';
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
