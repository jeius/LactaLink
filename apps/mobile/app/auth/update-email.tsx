import { updateEmail } from '@/auth';
import { TextInputField } from '@/components/form-fields/TextInputField';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { zodResolver } from '@hookform/resolvers/zod';
import { emailSchema } from '@lactalink/form-schemas';
import { useRouter } from 'expo-router';
import { MailIcon } from 'lucide-react-native';
import { useForm, useFormState } from 'react-hook-form';
import { toast } from 'sonner-native';
import { z } from 'zod';

const schema = z.object({ email: emailSchema });
type Schema = z.infer<typeof schema>;

export default function UpdateEmail() {
  const router = useRouter();

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const { isSubmitting } = useFormState({ control });

  async function onSubmit({ email }: Schema) {
    try {
      const message = await updateEmail(email);
      toast.success(message);
    } catch (error) {
      toast.error('Failed to update email. Please try again.');
      console.error('Error updating email:', error);
    }
  }

  return (
    <SafeArea className="items-stretch">
      <KeyboardAvoidingScrollView contentContainerClassName="grow p-5 justify-center">
        <Card className="p-0">
          <VStack space="2xl" className="p-5">
            <VStack space="sm">
              <Text bold size="2xl">
                Change your email address
              </Text>
              <Text size="md" className="text-typography-700">
                Enter your new email.
              </Text>
            </VStack>

            <TextInputField
              control={control}
              name="email"
              label="New Email"
              inputProps={{
                placeholder: 'name@example.com',
                'aria-label': 'Enter new email address',
                autoCorrect: false,
                autoCapitalize: 'none',
                autoComplete: 'email',
                keyboardType: 'email-address',
                icon: MailIcon,
                iconClassName: 'text-primary-500',
              }}
            />

            <Button
              size="lg"
              className="mt-4"
              onPress={handleSubmit(onSubmit)}
              isDisabled={isSubmitting}
            >
              {isSubmitting && <ButtonSpinner />}
              <ButtonText>Update Email</ButtonText>
            </Button>
          </VStack>
        </Card>
      </KeyboardAvoidingScrollView>
    </SafeArea>
  );
}
