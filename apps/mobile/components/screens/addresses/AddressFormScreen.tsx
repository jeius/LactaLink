import { useForm } from '@/components/contexts/FormProvider';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import { Box } from '@/components/ui/box';
import AddressForm from '@/features/address/components/AddressForm';
import {
  useAddAddressMutation,
  useUpdateAddressMutation,
} from '@/features/address/hooks/mutations';
import { RedirectSearchParams } from '@/lib/types/searchParams';
import { getDirtyData } from '@/lib/utils/getDirtyData';
import { AddressCreateSchema } from '@lactalink/form-schemas/address';
import { Address } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useFormState } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

type Params = RedirectSearchParams & { id?: string };

export default function AddressFormScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { redirect, id } = useLocalSearchParams<Params>();
  const isEditMode = Boolean(id);

  const { handleSubmit, control } = useForm<AddressCreateSchema>();
  const { dirtyFields } = useFormState({ control });

  const { mutateAsync: createAddr } = useAddAddressMutation();
  const { mutateAsync: updateAddr } = useUpdateAddressMutation();

  async function onSubmit(formData: AddressCreateSchema) {
    const dirtyData = getDirtyData(formData, dirtyFields);

    const promise = isEditMode ? updateAddr({ ...dirtyData, id: id! }) : createAddr(formData);

    toast.promise(promise, {
      loading: 'Saving address...',
      success: (data: Address) =>
        `"${data.name || 'Address'}" ${isEditMode ? 'updated' : 'created'} successfully.`,
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
