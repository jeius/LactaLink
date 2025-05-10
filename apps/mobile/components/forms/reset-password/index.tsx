import { Button, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { useAppToast } from '@/hooks/useAppToast';
import { supabase } from '@/lib/supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordSchema } from '@lactalink/types';
import { router } from 'expo-router';
import { AlertCircleIcon, EyeClosedIcon, EyeIcon, LockIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function ResetPasswordForm() {
  const [showPass, setShowPass] = useState(false);
  const toast = useAppToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  async function onSubmit({ password }: ResetPasswordSchema) {
    const id = 'reset-password';

    toast.show({ id, type: 'loading', message: 'Updating password...' });

    const res = await supabase.auth.updateUser({ password });

    if (res.error) {
      toast.show({ id, type: 'error', message: res.error.message });
      return;
    }

    toast.show({ id, type: 'success', message: 'Password updated.' });

    if (router.canDismiss()) {
      router.dismiss();
    } else {
      router.replace('/auth/sign-in');
    }
  }

  return (
    <VStack space="lg">
      <FormControl isInvalid={!!errors['password']}>
        <FormControlLabel>
          <FormControlLabelText>New Password</FormControlLabelText>
        </FormControlLabel>

        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <Input variant="outline" size="lg">
              <InputIcon as={LockIcon} className="text-primary-500 ml-3" />
              <InputField
                ref={field.ref}
                type={showPass ? 'text' : 'password'}
                placeholder={'Enter unique password'}
                autoCorrect={false}
                autoCapitalize="none"
                autoComplete={'new-password'}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />
              {field.value && (
                <InputSlot className="px-2" onPress={() => setShowPass((prev) => !prev)}>
                  <InputIcon as={showPass ? EyeIcon : EyeClosedIcon} />
                </InputSlot>
              )}
            </Input>
          )}
        />

        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} size="sm" />
          <FormControlErrorText size="sm">{errors['password']?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>

      <FormControl isInvalid={!!errors['confirmPassword']}>
        <FormControlLabel>
          <FormControlLabelText>Confirm Password</FormControlLabelText>
        </FormControlLabel>

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <Input variant="outline" size="lg">
              <InputIcon as={LockIcon} className="text-primary-500 ml-3" />
              <InputField
                ref={field.ref}
                type={showPass ? 'text' : 'password'}
                placeholder={'Confirm your password'}
                autoCorrect={false}
                autoCapitalize="none"
                autoComplete={'new-password'}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />
              {field.value && (
                <InputSlot className="px-2" onPress={() => setShowPass((prev) => !prev)}>
                  <InputIcon as={showPass ? EyeIcon : EyeClosedIcon} />
                </InputSlot>
              )}
            </Input>
          )}
        />

        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} size="sm" />
          <FormControlErrorText size="sm">
            {errors['confirmPassword']?.message}
          </FormControlErrorText>
        </FormControlError>
      </FormControl>

      <Button size="lg" className="mt-4" onPress={handleSubmit(onSubmit)}>
        <ButtonText>{isSubmitting ? 'Updating...' : 'Confirm'}</ButtonText>
      </Button>
    </VStack>
  );
}
