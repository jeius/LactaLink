import { DeleteActionButton } from '@/components/buttons';
import { useForm } from '@/components/contexts/FormProvider';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import { ActionModal } from '@/components/modals/ActionModal';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import AddressForm from '@/features/address/components/AddressForm';
import {
  useAddAddressMutation,
  useDeleteAddressMutation,
  useUpdateAddressMutation,
} from '@/features/address/hooks/mutations';
import { TOAST_ID } from '@/lib/constants';
import { RedirectSearchParams } from '@/lib/types/searchParams';
import { getDirtyData } from '@/lib/utils/getDirtyData';
import { AddressCreateSchema } from '@lactalink/form-schemas/address';
import { Address } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { SaveIcon } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { useFormState, useWatch } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

type Params = RedirectSearchParams & { id?: string };

export default function AddressFormScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { redirect, id } = useLocalSearchParams<Params>();

  const isEditMode = Boolean(id);

  const { handleSubmit, control, trigger } = useForm<AddressCreateSchema>();
  const { dirtyFields, isSubmitting, isDirty } = useFormState({ control });
  const addressName = useWatch({ control, name: 'name' });

  const { mutateAsync: createAddr } = useAddAddressMutation();
  const { mutateAsync: updateAddr } = useUpdateAddressMutation();
  const { mutate: deleteAddress } = useDeleteAddressMutation();

  const goBack = useCallback(() => {
    if (redirect) router.dismissTo(redirect as Href);
    else router.dismissAll();
  }, [redirect, router]);

  const handleDelete = useCallback(() => {
    if (!id) return;
    deleteAddress(id);
    goBack();
  }, [deleteAddress, goBack, id]);

  const handleValidation = useCallback(async () => {
    const isValid = await trigger();
    if (!isValid) {
      toast.error('Please fill the form correctly before saving.', { id: TOAST_ID.ERROR });
      throw new Error('Form validation failed');
    }
  }, [trigger]);

  async function onSubmit(formData: AddressCreateSchema) {
    const dirtyData = getDirtyData(formData, dirtyFields);

    const promise = isEditMode ? updateAddr({ ...dirtyData, id: id! }) : createAddr(formData);

    toast.promise(promise, {
      loading: 'Saving address...',
      success: ({ address }: { address: Address }) =>
        `"${address.name || 'Address'}" ${isEditMode ? 'updated' : 'created'} successfully.`,
      error: (err) => extractErrorMessage(err) || 'Failed to save address.',
    });

    await promise;

    goBack();
  }

  return (
    <>
      {/* Sheet Handle */}
      <Box className="h-10 items-center justify-center">
        <Box className="h-1 w-12 rounded-full bg-primary-500" />
      </Box>

      {/* Form */}
      <KeyboardAvoidingScrollView style={{ marginBottom: insets.bottom }}>
        <AddressForm control={control} />
        <VStack space="xl" className="p-4">
          <ActionModal
            className="mt-5"
            isDisabled={isSubmitting || !isDirty}
            triggerLabel="Save Address"
            triggerIcon={SaveIcon}
            title="Review Address"
            description="Are you sure you want to save this address?"
            onTriggerPress={handleValidation}
            confirmLabel="Save"
            onConfirm={handleSubmit(onSubmit)}
          />
          {isEditMode && (
            <DeleteActionButton
              iconOnly={false}
              triggerLabel="Delete Address"
              disablePressAnimation
              itemName={addressName || 'this address'}
              className="self-center"
              onConfirm={handleDelete}
            />
          )}
        </VStack>
      </KeyboardAvoidingScrollView>
    </>
  );
}
