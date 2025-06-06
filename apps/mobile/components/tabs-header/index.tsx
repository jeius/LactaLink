import { useAuth } from '@/hooks/auth/useAuth';
import { Avatar as AvatarType, Hospital, Individual, MilkBank } from '@lactalink/types';
import { extractName } from '@lactalink/utilities';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, AvatarFallbackText, AvatarImage } from '../ui/avatar';
import { HStack } from '../ui/hstack';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';

export function TabsHeader() {
  const { user, isLoading } = useAuth();

  const name = user && extractName(user);
  const avatar = (user?.profile?.value as Individual | Hospital | MilkBank)
    ?.avatar as AvatarType | null;
  const avatarUrl = avatar?.thumbnailURL || avatar?.url || null;
  const avatarWidth = avatar?.sizes?.thumbnail?.width || 300;
  const avatarHeight = avatar?.sizes?.thumbnail?.height || 300;

  return (
    <SafeAreaView className="bg-background-0 h-28 shadow">
      <HStack className="flex-1 items-center justify-between px-5">
        <Text size="xl" className="font-JakartaSemiBold">
          Welcome{`, ${name}`}!{' '}
        </Text>

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
      </HStack>
    </SafeAreaView>
  );
}
