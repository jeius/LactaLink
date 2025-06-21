import { useAuth } from '@/hooks/auth/useAuth';
import { Avatar as AvatarType } from '@lactalink/types';
import { ComponentProps } from 'react';
import * as UIAvatar from './ui/avatar';
import { Skeleton } from './ui/skeleton';

type AvatarProps = ComponentProps<typeof UIAvatar.Avatar> & {
  showBadge?: boolean;
  status?: ComponentProps<typeof UIAvatar.AvatarBadge>['status'];
};

export default function Avatar({ showBadge = false, status: badgeStatus, ...props }: AvatarProps) {
  const { profile, isLoading } = useAuth();
  const avatarName =
    (profile && ('name' in profile ? profile.name : profile.displayName)) || 'User';
  let avatarUrl: string | null = (profile?.avatar as AvatarType | undefined)?.url || null;

  switch (props.size) {
    case 'xs':
      avatarUrl = (profile?.avatar as AvatarType | undefined)?.sizes?.icon?.url || null;
      break;
    case 'sm':
    case 'md':
      avatarUrl = (profile?.avatar as AvatarType | undefined)?.sizes?.thumbnail?.url || avatarUrl;
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
          {avatarUrl && <UIAvatar.AvatarImage source={{ uri: avatarUrl }} alt={avatarName} />}
          {showBadge && <UIAvatar.AvatarBadge status={badgeStatus} />}
        </UIAvatar.Avatar>
      )}
    </>
  );
}
