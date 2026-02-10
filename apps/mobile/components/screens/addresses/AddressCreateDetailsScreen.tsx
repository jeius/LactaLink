import { useForm } from '@/components/contexts/FormProvider';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import { Box } from '@/components/ui/box';
import AddressForm from '@/features/address/components/AddressForm';
import { useAddAddressMutation } from '@/features/address/hooks/mutations';
import { RedirectSearchParams } from '@/lib/types/searchParams';
import { AddressCreateSchema } from '@lactalink/form-schemas/address';
import { Address } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function AddressCreateDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { redirect } = useLocalSearchParams<RedirectSearchParams>();

  const { handleSubmit } = useForm<AddressCreateSchema>();
  const { mutateAsync } = useAddAddressMutation();

  async function onSubmit(formData: AddressCreateSchema) {
    const promise = mutateAsync(formData);

    toast.promise(promise, {
      loading: 'Saving address...',
      success: (data: Address) => `"${data.name || 'Address'}" created successfully.`,
      error: (err) => extractErrorMessage(err) || 'Failed to save address.',
    });

    await promise;

    if (redirect) {
      router.dismissTo(redirect as Href);
    } else {
      router.dismissAll();
    }
  }

  return (
    <>
      <Box className="h-10 items-center justify-center">
        <Box className="h-1 w-12 rounded-full bg-primary-500" />
      </Box>
      <KeyboardAvoidingScrollView style={{ marginBottom: insets.bottom }}>
        <AddressForm onSavePress={handleSubmit(onSubmit)} />
      </KeyboardAvoidingScrollView>
    </>
  );
}
