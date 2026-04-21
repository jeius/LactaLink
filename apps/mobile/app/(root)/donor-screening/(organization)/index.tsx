import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useStandardScreeningFormQuery } from '@/features/donor-screening/hooks/queries';
import { useMyOrgScreeningForm } from '@/features/donor-screening/hooks/useMyOrgScreeningForm';
import { Link, Redirect } from 'expo-router';
import {
  ClipboardCheckIcon,
  ClipboardListIcon,
  EyeIcon,
  PlusCircleIcon,
} from 'lucide-react-native';

export default function OrganizationScreeningOverview() {
  const { form, ...formQuery } = useMyOrgScreeningForm({ _status: 'published' });
  const { form: draftForm, ...draftFormQuery } = useMyOrgScreeningForm({ isDraft: true });
  const { data: standardForm, ...standardFormQuery } = useStandardScreeningFormQuery();

  const isLoading = formQuery.isLoading || draftFormQuery.isLoading || standardFormQuery.isLoading;

  if (isLoading) return <LoadingSpinner />;

  if (form) {
    return <Redirect href="/donor-screening/form" />;
  }

  if (draftForm) {
    return <Redirect href={`/donor-screening/form/${draftForm.id}`} />;
  }

  return (
    <SafeArea className="items-stretch">
      <VStack space="xl" className="items-center justify-center px-6">
        <Box className="rounded-full bg-background-100 p-6">
          <Icon
            as={ClipboardListIcon}
            className="text-primary-400"
            style={{ width: 48, height: 48 }}
          />
        </Box>
        <VStack space="sm" className="items-center">
          <Heading size="xl" className="text-center">
            Set Up Your Donor Screening Form
          </Heading>
          <Text size="md" className="text-center text-typography-500">
            Create a screening questionnaire to help identify and onboard eligible breast milk
            donors for your organization.
          </Text>
        </VStack>
        <Link asChild href="/donor-screening/form/create">
          <Button size="lg">
            <ButtonIcon as={PlusCircleIcon} />
            <ButtonText>Create Screening Form</ButtonText>
          </Button>
        </Link>

        {standardForm && (
          <>
            <HStack space="md" className="w-full items-center">
              <Divider className="flex-1" />
              <Text size="sm" className="text-typography-400">
                or
              </Text>
              <Divider className="flex-1" />
            </HStack>

            <Box className="w-full rounded-2xl bg-background-100 p-5">
              <VStack space="md">
                <HStack space="md" className="items-center">
                  <Box className="rounded-full bg-background-200 p-3">
                    <Icon
                      as={ClipboardCheckIcon}
                      className="text-primary-400"
                      style={{ width: 24, height: 24 }}
                    />
                  </Box>
                  <VStack space="xs" className="flex-1">
                    <Heading size="sm">Use Standard Form</Heading>
                    <Text size="xs" className="text-typography-500">
                      Start from a system-provided template you can fully customize.
                    </Text>
                  </VStack>
                </HStack>

                <HStack space="sm">
                  <Link asChild href={`/donor-screening/form/preview/${standardForm.id}`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      <ButtonIcon as={EyeIcon} />
                      <ButtonText>Preview</ButtonText>
                    </Button>
                  </Link>
                  <Link asChild href={`/donor-screening/form/create/template/${standardForm.id}`}>
                    <Button size="sm" className="flex-1">
                      <ButtonText>Use as Template</ButtonText>
                    </Button>
                  </Link>
                </HStack>
              </VStack>
            </Box>
          </>
        )}
      </VStack>
    </SafeArea>
  );
}
