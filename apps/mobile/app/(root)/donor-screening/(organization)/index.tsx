import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { useOrganizationScreeningFormQuery } from '@/features/donor-screening/hooks/queries';
import { useMeUser } from '@/hooks/auth/useAuth';
import { Redirect } from 'expo-router';

export default function OrganizationScreeningOverview() {
  const { data: meUser } = useMeUser();

  const organization = meUser?.profile?.relationTo === 'individuals' ? null : meUser?.profile;
  const { data: form, isLoading } = useOrganizationScreeningFormQuery(organization);

  if (isLoading) return <LoadingSpinner />;

  if (form) {
    return <Redirect href="/donor-screening/form" />;
  }

  return (
    <SafeArea>
      <Heading size="2xl">
        It looks like you don&apos;t have a donor screening form set up yet.
      </Heading>
      <Button className="mt-2">
        <ButtonText>Create a Form</ButtonText>
      </Button>
    </SafeArea>
  );
}
