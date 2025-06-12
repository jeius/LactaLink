import { updatePassword } from '@/auth';
import { FormField } from '@/components/FormField';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordSchema } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities';
import { LockIcon } from 'lucide-react-native';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner-native';

export default function ResetPasswordForm() {
  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit({ password }: ResetPasswordSchema) {
    const updatePromise = updatePassword(password);

    toast.promise(updatePromise, {
      loading: 'Updating password...',
      success: (msg) => msg,
      error: (error) => extractErrorMessage(error),
    });

    await updatePromise;
  }

  return (
    <FormProvider {...form}>
      <VStack space="lg">
        <FormField
          name="password"
          label="New Password"
          placeholder="Enter unique password"
          fieldType="password"
          autoCorrect={false}
          autoCapitalize="none"
          autoComplete={'new-password'}
          inputIcon={LockIcon}
        />

        <FormField
          name="confirmPassword"
          label="Confirm Password"
          fieldType="password"
          placeholder="Confirm your password"
          autoCorrect={false}
          autoCapitalize="none"
          autoComplete={'new-password'}
          inputIcon={LockIcon}
        />

        <Button
          isDisabled={isSubmitting}
          size="lg"
          className="mt-4"
          onPress={form.handleSubmit(onSubmit)}
        >
          <ButtonText>{isSubmitting ? 'Updating...' : 'Confirm'}</ButtonText>
        </Button>
      </VStack>
    </FormProvider>
  );
}
