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
  const avatarUrl = avatar?.sizes?.thumbnail?.url || avatar?.url || null;

  return (
    <>
      {isLoading && <Skeleton className="h-12 w-12" speed={4} variant="circular" />}

      {!isLoading && (
        <Avatar className="border-primary-600 border-2">
          <AvatarFallbackText>{name || 'User'}</AvatarFallbackText>
          {avatarUrl && (
            <AvatarImage alt={avatar?.alt || 'User Avatar'} source={{ uri: avatarUrl }} />
          )}
        </Avatar>
      )}
    </>
  );
}
