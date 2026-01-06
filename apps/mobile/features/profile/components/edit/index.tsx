import { HeaderBackButton } from '@/components/HeaderBackButton';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import { AnimatedPressable } from '@/components/animated/pressable';
import { Form } from '@/components/contexts/FormProvider';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
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

  const { mutateAsync } = useUpdateProfileMutation(profile);

  const renderForm: Record<ProfileSlug, React.ReactNode> = {
    individuals: <PersonalEditForm control={methods.control} />,
    hospitals: <HospitalEditForm control={methods.control} />,
    milkBanks: <MilkBankEditForm control={methods.control} />,
  };

  const onSubmit = async (data: EditProfileSchema) => {
    const { id: _, slug: __, ...finalData } = getDirtyData(data, formState.dirtyFields);

    const promise = mutateAsync(finalData);

    toast.promise(promise, {
      loading: 'Updating profile...',
      success: () => 'Profile updated successfully!',
      error: (err) => extractErrorMessage(err),
    });
  };

  return (
    <Form {...methods}>
      <HStack className="items-center gap-4 px-2 py-5 pb-2">
        <HeaderBackButton />
        <Text size="xl" bold className="grow">
          Update Profile
        </Text>
        <AnimatedPressable
          disabled={!formState.isDirty}
          className="px-3 py-2"
          onPress={handleSubmit(onSubmit)}
        >
          <Text className="font-JakartaSemiBold">Save</Text>
        </AnimatedPressable>
      </HStack>
      <KeyboardAvoidingScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-2 pt-2"
      >
        <AvatarField control={methods.control} />
        {renderForm[slug]}
      </KeyboardAvoidingScrollView>
    </Form>
  );
}
