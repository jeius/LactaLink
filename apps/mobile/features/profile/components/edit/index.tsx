import { HeaderBackButton } from '@/components/HeaderBackButton';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import { Form } from '@/components/contexts/FormProvider';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { getDirtyData } from '@/lib/utils/getDirtyData';
import { EditProfileSchema } from '@lactalink/form-schemas';
import { PopulatedUserProfile } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import React from 'react';
import { toast } from 'sonner-native';
import { useUpdateProfileMutation } from '../../hooks/mutations';
import { useEditProfileForm } from '../../hooks/useEditProfileForm';
import { AvatarField } from './AvatarField';
import HospitalEditForm from './HospitalEditForm';
import MilkBankEditForm from './MilkBankEditForm';
import { PersonalEditForm } from './PersonalEditForm';

type ProfileSlug = PopulatedUserProfile['relationTo'];

interface ProfileEditFormProps {
  profile: PopulatedUserProfile;
}

export default function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const slug = profile.relationTo;

  const methods = useEditProfileForm(profile);
  const { formState, handleSubmit } = methods;
  const { isDirty, isSubmitting, dirtyFields } = formState;

  const { mutateAsync: updateProfile } = useUpdateProfileMutation(profile);
  const profileName =
    profile.value.displayName ||
    ('name' in profile.value ? profile.value.name : undefined) ||
    'Profile';

  const renderForm: Record<ProfileSlug, React.ReactNode> = {
    individuals: <PersonalEditForm control={methods.control} />,
    hospitals: <HospitalEditForm control={methods.control} />,
    milkBanks: <MilkBankEditForm control={methods.control} />,
  };

  const onSubmit = async (data: EditProfileSchema) => {
    const { id: _, slug: __, ...finalData } = getDirtyData(data, dirtyFields);

    await updateProfile(finalData).catch((err) => toast.error(extractErrorMessage(err)));
  };

  return (
    <Form {...methods}>
      <HStack className="items-center gap-4 bg-primary-400 px-4 py-5">
        <HeaderBackButton />
        <Text size="xl" bold className="grow text-primary-0">
          Edit Profile
        </Text>
      </HStack>
      <KeyboardAvoidingScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-2 pb-8"
      >
        <AvatarField control={methods.control} name={profileName} />
        <VStack space="lg" className="mx-4 rounded-3xl border border-primary-100 bg-background-0 py-5">
          {renderForm[slug]}
        </VStack>
        <HStack space="md" className="px-5 pt-3">
          <Button variant="outline" className="flex-1 rounded-xl" onPress={() => methods.reset()}><ButtonText>Cancel</ButtonText></Button>
          <Button disabled={!isDirty || isSubmitting} className="flex-1 rounded-xl" onPress={handleSubmit(onSubmit)}>{isSubmitting ? <Spinner size="small" /> : <ButtonText>Save Changes</ButtonText>}</Button>
        </HStack>
      </KeyboardAvoidingScrollView>
    </Form>
  );
}
