import { useAuth } from '@/hooks/auth/useAuth';
import { Avatar as AvatarType, Hospital, Individual, MilkBank } from '@lactalink/types';

import React from 'react';

import { extractName } from '@lactalink/utilities';
import { Avatar, AvatarFallbackText, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';

export function HeaderAvatar() {
  const { user, isLoading } = useAuth();

  const name = user && extractName(user);
  const avatar = (user?.profile?.value as Individual | Hospital | MilkBank)
    ?.avatar as AvatarType | null;
  const avatarUrl = avatar?.thumbnailURL || avatar?.url || null;
  const avatarWidth = avatar?.sizes?.thumbnail?.width || 300;
  const avatarHeight = avatar?.sizes?.thumbnail?.height || 300;

  return (
    <>
      {isLoading && <Skeleton className="h-12 w-12" speed={4} variant="circular" />}

      {!isLoading && (
        <Avatar>
          <AvatarFallbackText>{name || 'User'}</AvatarFallbackText>
          {avatarUrl && (
            <AvatarImage
              alt={avatar?.alt || 'User Avatar'}
              source={{ uri: avatarUrl, width: avatarWidth, height: avatarHeight }}
            />
          )}
        </Avatar>
      )}
    </>
  );
}
