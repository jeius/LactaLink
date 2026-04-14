import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { DonorScreeningForm } from '@lactalink/types/payload-generated-types';
import { useRouter } from 'expo-router';
import { InfoIcon, ShieldCheckIcon, StethoscopeIcon } from 'lucide-react-native';
import { useCallback } from 'react';
import { toast } from 'sonner-native';

interface OnboardingProps {
  form: DonorScreeningForm;
}

export default function ScreeningOnboarding({ form }: OnboardingProps) {
  const router = useRouter();

  const { title, sections, fields } = form;

  const handleProceed = useCallback(() => {
    if (fields && fields.length > 0) {
      router.push(`/donor-screening/form/${form.id}`);
    } else if (sections && sections.length > 0) {
      router.push(`/donor-screening/form/${form.id}/section/${sections[0]!.id}`);
    } else {
      toast.error('This screening form is not properly configured. Please contact support.');
    }
  }, [fields, sections, router, form.id]);

  return (
    <VStack space="2xl" className="p-6 pt-0">
      {/* Hero */}
      <VStack space="md" className="items-center py-4">
        <Box className="rounded-full bg-primary-100 p-6">
          <Icon
            as={StethoscopeIcon}
            style={{ width: 64, height: 64 }}
            className="stroke-primary-600"
          />
        </Box>
        <Heading size="3xl" className="text-center">
          {title}
        </Heading>
        <Text size="md" italic className="text-center text-typography-500">
          Complete this screening to begin your donation journey.
        </Text>
      </VStack>

      {/* Info alert */}
      <Alert action="info" className="rounded-2xl">
        <AlertIcon as={InfoIcon} />
        <AlertText className="flex-1">
          Your responses are reviewed by our medical team to ensure safe donations for recipients.
        </AlertText>
      </Alert>

      {/* Sections overview */}
      {sections && sections.length > 0 && (
        <VStack space="md">
          <Heading size="md">{"What You'll Be Asked"}</Heading>
          <Divider />
          <VStack space="sm">
            {sections.map((section, index) => (
              <HStack key={section.id ?? index} space="md" className="items-start py-1">
                <Box className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500">
                  <Text bold size="sm" className="text-typography-0">
                    {index + 1}
                  </Text>
                </Box>
                <VStack space="xs" className="flex-1">
                  <Text bold>{section.title}</Text>
                  {section.description && (
                    <Text size="sm" className="text-typography-600">
                      {section.description}
                    </Text>
                  )}
                  {section.fields && section.fields.length > 0 && (
                    <Badge size="sm" variant="outline" action="muted" className="self-start">
                      <BadgeText>
                        {section.fields.length} question{section.fields.length !== 1 ? 's' : ''}
                      </BadgeText>
                    </Badge>
                  )}
                </VStack>
              </HStack>
            ))}
          </VStack>
        </VStack>
      )}

      {/* Confidentiality note */}
      <HStack space="sm" className="items-center rounded-xl bg-background-50 p-3">
        <Icon as={ShieldCheckIcon} className="shrink-0 text-success-600" />
        <Text size="sm" className="flex-1 text-typography-600">
          Your answers are private and confidential.
        </Text>
      </HStack>

      {/* CTA */}
      <VStack space="sm">
        <Button size="lg" onPress={handleProceed}>
          <ButtonText>{'Start Screening'}</ButtonText>
        </Button>
        <Text size="xs" className="text-center text-typography-500">
          You can save your progress and continue later.
        </Text>
      </VStack>
    </VStack>
  );
}
