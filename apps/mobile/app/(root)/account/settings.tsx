import { requestPasswordChange } from '@/auth';
import { ActionModal } from '@/components/modals/ActionModal';
import SafeArea from '@/components/SafeArea';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable, PressableProps } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { getMeUser } from '@/lib/stores/meUserStore';
import { OTPSearchParams } from '@/lib/types/searchParams';
import { useRouter } from 'expo-router';
import {
  ChevronRightIcon,
  KeyRoundIcon,
  LucideIcon,
  LucideProps,
  MailIcon,
  Trash2Icon,
  UserRoundPenIcon,
} from 'lucide-react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { toast } from 'sonner-native';

export default function AccountSettings() {
  const router = useRouter();

  async function handleChangeEmail() {
    router.push('/auth/update-email');
  }

  async function handleEditProfile() {
    router.push('/account/edit-profile');
  }

  async function handleChangePassword() {
    const email = getMeUser()?.email;
    if (!email) {
      toast.error('Unable to retrieve email for password reset');
      return;
    }
    await requestPasswordChange(email);
    const params: OTPSearchParams = {
      email,
      type: 'recovery',
      redirect: '/auth/update-password',
    };
    router.push({ pathname: '/auth/verify-otp', params });
  }
  return (
    <SafeArea safeTop={false} className="items-stretch">
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow flex-col items-stretch"
        showsVerticalScrollIndicator={false}
      >
        <VStack className="grow items-stretch">
          {/* Account section */}
          <SectionHeader label="Account" />
          <VStack
            className="bg-background-0"
            style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'transparent' }}
          >
            <SettingsLink icon={MailIcon} label="Change Email" onPress={handleChangeEmail} />
            <Divider className="ml-12" />
            <SettingsLink
              icon={KeyRoundIcon}
              label="Change Password"
              onPress={handleChangePassword}
            />
          </VStack>

          {/* Profile section */}
          <SectionHeader label="Profile" />
          <VStack
            className="bg-background-0"
            style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'transparent' }}
          >
            <SettingsLink
              icon={UserRoundPenIcon}
              label="Edit Profile"
              onPress={handleEditProfile}
            />
          </VStack>

          {/* Danger zone section */}
          <SectionHeader label="Danger Zone" />
          <VStack
            className="bg-background-0 px-5 py-4"
            style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'transparent' }}
          >
            <ActionModal
              title="Delete Account"
              description="This will permanently delete your account and all associated data. This action cannot be undone."
              triggerButtonProps={{
                label: 'Delete Account',
                icon: Trash2Icon,
              }}
              confirmButtonProps={{
                label: 'Delete Account',
                action: 'negative',
              }}
              variant="solid"
              action="negative"
            />
          </VStack>
        </VStack>
      </ScrollView>
    </SafeArea>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <Text
      size="xs"
      className="px-5 pb-1 pt-5 font-JakartaMedium uppercase tracking-widest text-typography-500"
    >
      {label}
    </Text>
  );
}

interface SettingsLinkProps extends PressableProps {
  icon: LucideIcon | React.FC<LucideProps>;
  label: string;
}

function SettingsLink({ icon, label, ...props }: SettingsLinkProps) {
  return (
    <Pressable {...props}>
      <HStack space="sm" className="w-full items-center px-5 py-4">
        <Icon as={icon} className="stroke-typography-700" />
        <Text className="grow font-JakartaMedium">{label}</Text>
        <Icon as={ChevronRightIcon} className="stroke-typography-700" />
      </HStack>
    </Pressable>
  );
}
