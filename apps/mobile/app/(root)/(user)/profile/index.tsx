import { ProfileAvatar } from '@/components/Avatar';
import SafeArea from '@/components/SafeArea';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/auth/useAuth';
import { MailIcon, MapPinIcon, PhoneIcon, TruckIcon } from 'lucide-react-native';
import React from 'react';

export default function ProfileRedirect() {
  const { profile, user } = useAuth();

  const name = (profile && ('name' in profile ? profile.name : profile.displayName)) || 'No name';
  const email = user?.email || 'No email';
  const phone = user?.phone || 'No phone number';

  return (
    <SafeArea safeTop={false}>
      <VStack space="lg" className="items-center justify-center p-5">
        <VStack space="sm" className="items-center">
          <ProfileAvatar profile={profile} size="xl" />

          <Text className="font-JakartaSemiBold">{name}</Text>

          <VStack space="sm" className="items-start">
            <HStack space="sm" className="items-center">
              <Icon as={MailIcon} size="lg" />
              <Text size="sm">{email}</Text>
            </HStack>

            <HStack space="sm" className="items-center">
              <Icon as={PhoneIcon} size="lg" />
              <Text size="sm">{phone}</Text>
            </HStack>
          </VStack>
        </VStack>

        <Divider orientation="horizontal" className="bg-outline-500" />

        <HStack space="lg" className="w-full items-start">
          <Card className="flex-1">
            <VStack space="sm" className="items-center">
              <Icon as={MapPinIcon} size="2xl" />
              <Text size="sm" className="font-JakartaMedium">
                Addresses
              </Text>
            </VStack>
          </Card>
          <Card className="flex-1">
            <VStack space="sm" className="items-center">
              <Icon as={TruckIcon} size="2xl" />
              <Text size="sm" className="font-JakartaMedium">
                Delivery Preferences
              </Text>
            </VStack>
          </Card>
        </HStack>
      </VStack>
    </SafeArea>
  );
}
