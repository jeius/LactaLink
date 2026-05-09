import { signOut, updatePassword } from '@/auth';
import { TextInputField } from '@/components/form-fields/TextInputField';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { RedirectSearchParams } from '@/lib/types/searchParams';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordSchema } from '@lactalink/form-schemas';
import { Href, useRouter } from 'expo-router';
import { LockIcon } from 'lucide-react-native';
import { useForm, useFormState } from 'react-hook-form';
import { toast } from 'sonner-native';

export default function ResetPasswordForm({ redirect }: RedirectSearchParams) {
  const router = useRouter();

  const { control, handleSubmit } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const { isSubmitting } = useFormState({ control });

  async function onSubmit({ password }: ResetPasswordSchema) {
    try {
      const message = await updatePassword(password);
      toast.success(message);

      if (redirect) {
        router.dismissTo(redirect as Href);
      } else {
        await signOut();
        router.replace('/auth/sign-in');
      }
    } catch (error) {
      toast.error('Failed to update password. Please try again.');
      console.error('Error updating password:', error);
    }
  }

  return (
    <VStack space="lg">
      <TextInputField
        control={control}
        name="password"
        label="New Password"
        contentPosition="first"
        inputProps={{
          placeholder: 'Enter unique password',
          autoCapitalize: 'none',
          autoComplete: 'new-password',
          icon: LockIcon,
          type: 'password',
        }}
      />

      <TextInputField
        control={control}
        name="confirmPassword"
        label="Confirm Password"
        contentPosition="first"
        inputProps={{
          placeholder: 'Confirm your password',
          autoCapitalize: 'none',
          autoComplete: 'new-password',
          icon: LockIcon,
          type: 'password',
        }}
      />

      <Button isDisabled={isSubmitting} size="lg" className="mt-4" onPress={handleSubmit(onSubmit)}>
        {isSubmitting && <ButtonSpinner />}
        <ButtonText>{isSubmitting ? 'Updating...' : 'Confirm'}</ButtonText>
      </Button>
    </VStack>
  );
}
