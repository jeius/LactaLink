import ResetPasswordForm from '@/components/forms/ResetPasswordForm';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import SafeArea from '@/components/SafeArea';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export default function UpdatePassword() {
  return (
    <SafeArea className="items-stretch">
      <KeyboardAvoidingScrollView contentContainerClassName="grow p-5 justify-center">
        <Card className="p-0">
          <VStack space="2xl" className="p-5">
            <VStack space="sm">
              <Text bold size="2xl">
                Change your password
              </Text>
              <Text size="md" className="text-typography-700">
                Enter your new password.
              </Text>
            </VStack>

            <ResetPasswordForm redirect="/accounts/settings" />
          </VStack>
        </Card>
      </KeyboardAvoidingScrollView>
    </SafeArea>
  );
}
