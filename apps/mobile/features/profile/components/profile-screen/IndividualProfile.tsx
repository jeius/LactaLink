import { VerificationAlert } from '@/components/alerts/VerificationAlert';
import { AnimatedPressable } from '@/components/animated/pressable';
import { Avatar, AvatarFallbackText } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { isMeUser } from '@/lib/utils/isMeUser';
import { PopulatedUserProfile } from '@lactalink/types';
import { Individual } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractImageData } from '@lactalink/utilities/extractors';
import { Link } from 'expo-router';
import { BabyIcon, CalendarDaysIcon, Edit2Icon, MailIcon, MapPinIcon, PhoneIcon, UserIcon, UsersIcon } from 'lucide-react-native';
import React from 'react';
import ProfileCTA from './ProfileCTA';
import ProfileFeatureCard from './ProfileFeatureCard';

interface IndividualProfileProps {
  profile: Extract<PopulatedUserProfile, { value: Individual }>;
}

export default function IndividualProfile({ profile }: IndividualProfileProps) {
  const person = profile.value;
  const user = extractCollection(person.owner);
  const isOwner = Boolean(user && isMeUser(user));
  const name = person.displayName || person.givenName || 'Unknown User';
  const avatar = extractCollection(person.avatar);
  const avatarImage = avatar ? extractImageData(avatar) : null;
  const address = extractCollection(person.defaultAddress)?.displayName || 'No address';
  const details = [
    { label: 'Full Name', value: name, icon: UserIcon },
    { label: 'Email Address', value: user?.email || 'No email', icon: MailIcon },
    { label: 'Phone Number', value: person.phone || 'No phone number', icon: PhoneIcon },
    { label: 'Address', value: address, icon: MapPinIcon },
  ];

  return (
    <VStack className="items-stretch bg-primary-50">
      <Box className="h-52 overflow-hidden bg-primary-100">
        {avatarImage?.uri ? (
          <Image source={{ uri: avatarImage.uri }} alt={`${name} cover`} className="h-full w-full" contentFit="cover" blurRadius={5} />
        ) : (
          <VStack className="h-full items-center justify-center bg-primary-100"><Icon as={UserIcon} size="2xl" className="text-primary-300" /></VStack>
        )}
        <Box className="absolute inset-0 bg-primary-100 opacity-30" />
      </Box>

      <VStack className="-mt-5 items-stretch rounded-t-3xl bg-background-50 px-5 pb-6">
        <VStack className="items-center" style={{ marginTop: -58 }}>
          <Box className="h-28 w-28 overflow-hidden rounded-full border-8 border-background-50 bg-primary-50">
            {avatarImage?.uri ? <Image source={{ uri: avatarImage.uri }} alt={avatarImage.alt || name} className="h-full w-full" contentFit="cover" /> : <Avatar size="xl" className="h-full w-full"><AvatarFallbackText>{name}</AvatarFallbackText></Avatar>}
          </Box>
          <Text size="2xl" bold className="mt-2 text-center text-typography-950">{name}</Text>
          <HStack space="xs" className="mt-1 items-center rounded-full bg-primary-50 px-4 py-2"><Icon as={UserIcon} size="sm" className="text-primary-700" /><Text className="font-JakartaMedium text-primary-800">Individual</Text></HStack>
        </VStack>

        {isOwner && <Box className="absolute right-4 top-4"><Link href={`/profile/${profile.relationTo}/${person.id}/edit`} asChild><AnimatedPressable className="rounded-full bg-background-0 p-3"><Icon as={Edit2Icon} className="text-primary-700" /></AnimatedPressable></Link></Box>}
        {isOwner && !person.isVerified && <VerificationAlert />}
        {!isOwner && <ProfileCTA profile={profile} />}

        <Card className="mt-5 rounded-2xl border border-primary-100 bg-background-0 p-4">
          <Text bold size="lg" className="mb-2 text-primary-800">Personal Information</Text>
          {details.map((detail, index) => <React.Fragment key={detail.label}><HStack space="md" className="items-center py-3"><Box className="h-10 w-10 items-center justify-center rounded-xl bg-primary-50"><Icon as={detail.icon} className="text-primary-700" /></Box><Text className="w-32 text-typography-600">{detail.label}</Text><Text className="min-w-0 flex-1 font-JakartaMedium" numberOfLines={2}>{detail.value}</Text></HStack>{index < details.length - 1 && <Divider className="ml-14" />}</React.Fragment>)}
        </Card>

        <Card className="mt-4 rounded-2xl border border-primary-100 bg-background-0 p-4"><HStack className="items-stretch"><PersonalStat icon={BabyIcon} value={person.dependents ?? 0} label="Dependents" /><Divider orientation="vertical" /><PersonalStat icon={CalendarDaysIcon} value={person.birth ? new Date(person.birth).getFullYear() : '—'} label="Birth Year" /><Divider orientation="vertical" /><PersonalStat icon={UsersIcon} value={person.maritalStatus || '—'} label="Status" /></HStack></Card>
        <ProfileFeatureCard profile={profile} className="mt-4 rounded-2xl p-4" />
      </VStack>
    </VStack>
  );
}

function PersonalStat({ icon, value, label }: { icon: typeof UserIcon; value: string | number; label: string }) {
  return <VStack space="xs" className="flex-1 items-center px-2"><Box className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-50"><Icon as={icon} className="text-primary-600" /></Box><Text bold numberOfLines={1}>{value}</Text><Text size="xs" className="text-center text-typography-600">{label}</Text></VStack>;
}
