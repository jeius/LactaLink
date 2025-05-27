import { FormField } from '@/components/form-field';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { useAppToast } from '@/hooks/useAppToast';
import { UPDATE_PASSWORD_TOAST_ID } from '@/lib/constants';
import { showErrorToastWithId } from '@/lib/utils/showErrorToast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApiClient } from '@lactalink/api';
import { resetPasswordSchema, ResetPasswordSchema } from '@lactalink/types';
import { router } from 'expo-router';
import { LockIcon } from 'lucide-react-native';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

export default function ResetPasswordForm() {
  const toast = useAppToast();
  const apiClient = useApiClient();

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit({ password }: ResetPasswordSchema) {
    const id = UPDATE_PASSWORD_TOAST_ID;
    toast.show({ id, type: 'loading', message: 'Updating password...' });

    try {
      await apiClient.auth.updatePassword(password);

      toast.show({ id, type: 'success', message: 'Password updated.' });

      if (router.canDismiss()) {
        router.dismiss();
      } else {
        router.replace('/auth/sign-in');
      }
    } catch (error) {
      showErrorToastWithId(error, id);
    }
  }

  return (
    <FormProvider {...form}>
      <VStack space="lg">
        <FormField
          name="password"
          label="New Password"
          placeholder="Enter unique password"
          inputType="password"
          autoCorrect={false}
          autoCapitalize="none"
          autoComplete={'new-password'}
          inputIcon={LockIcon}
        />

        <FormField
          name="confirmPassword"
          label="Confirm Password"
          inputType="password"
          placeholder="Confirm your password"
          autoCorrect={false}
          autoCapitalize="none"
          autoComplete={'new-password'}
          inputIcon={LockIcon}
        />

        <Button size="lg" className="mt-4" onPress={form.handleSubmit(onSubmit)}>
          <ButtonText>{isSubmitting ? 'Updating...' : 'Confirm'}</ButtonText>
        </Button>
      </VStack>
    </FormProvider>
  );
}
