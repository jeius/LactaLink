import { HeaderBackButton } from '@/components/HeaderBackButton';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { NoData } from '@/components/NoData';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import ScrollView from '@/components/ui/ScrollView';
import ScreeningPreview from '@/features/donor-screening/components/ScreeningPreview';
import { useScreeningFormQuery } from '@/features/donor-screening/hooks/queries';
import { useErrorBoundary } from '@/hooks/useErrorBoundary';
import { Link, useLocalSearchParams } from 'expo-router';

export default function FormPreview() {
  const { id: formID } = useLocalSearchParams<{ id: string }>();
  const { data: form, isLoading, error } = useScreeningFormQuery(formID);

  useErrorBoundary(error);

  if (isLoading || form === undefined) return <LoadingSpinner />;

  if (form === null) {
    return <NoData title="The form was not found" />;
  }

  return (
    <>
      <SafeArea className="items-stretch">
        <HStack space="md" className="items-center justify-between p-2">
          <HeaderBackButton />

          <Link asChild href={`/donor-screening/form/create/template/${form.id}`}>
            <Button className="mr-2">
              <ButtonText>Use as Template</ButtonText>
            </Button>
          </Link>
        </HStack>
        <ScrollView contentContainerClassName="p-4">
          <Heading size="xl" className="mb-6 text-center">
            {form.title}
          </Heading>

          <ScreeningPreview form={form} />
        </ScrollView>
      </SafeArea>
    </>
  );
}
