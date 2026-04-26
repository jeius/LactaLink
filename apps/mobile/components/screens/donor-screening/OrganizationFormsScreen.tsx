import { AnimatedPressable } from '@/components/animated/pressable';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { InfiniteFlashList } from '@/components/ui/list';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useInfiniteOrgScreeningForms } from '@/features/donor-screening/hooks/queries';
import { SubmissionCreateSearchParams } from '@/features/donor-screening/lib/types';
import { useErrorBoundary } from '@/hooks/useErrorBoundary';
import { DonorScreeningFormField } from '@lactalink/types/collections';
import { DonorScreeningForm } from '@lactalink/types/payload-generated-types';
import { extractCollection, listKeyExtractor } from '@lactalink/utilities/extractors';
import { useRouter } from 'expo-router';
import { Building2Icon, BuildingIcon, ChevronRightIcon, HospitalIcon } from 'lucide-react-native';
import { useMemo } from 'react';

export default function OrganizationFormsScreen() {
  const { data: forms, error, refetch, isRefetching, ...query } = useInfiniteOrgScreeningForms();

  useErrorBoundary(error);

  return (
    <SafeArea safeTop={false} className="items-stretch justify-start">
      <InfiniteFlashList
        {...query}
        data={forms}
        keyExtractor={listKeyExtractor}
        contentContainerClassName="p-4 grow"
        refreshing={isRefetching}
        onRefresh={refetch}
        ItemSeparatorComponent={() => <Box className="h-3" />}
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item, isPlaceholder }) => {
          if (isPlaceholder) return <Skeleton className="h-20" />;
          return <RenderItem form={item} />;
        }}
      />
    </SafeArea>
  );
}

function RenderItem({ form }: { form: DonorScreeningForm }) {
  const router = useRouter();

  const org = form.organization;
  const isHospital = org?.relationTo === 'hospitals';
  const orgValue = extractCollection(org?.value);
  const orgName = orgValue?.displayName ?? orgValue?.name;
  const formTitle = form.title;
  const totalQuestions = useMemo(
    () =>
      countVisibleFields(form.fields) +
      (form.sections?.reduce((sum, s) => sum + countVisibleFields(s.fields), 0) ?? 0),
    [form.fields, form.sections]
  );

  return (
    <AnimatedPressable
      className="overflow-hidden rounded-2xl border border-outline-100"
      onPress={() =>
        router.push({
          pathname: `/donor-screening/submission/create`,
          params: { formID: form.id } satisfies SubmissionCreateSearchParams,
        })
      }
    >
      <HStack space="md" className="pointer-events-none items-center bg-background-0 p-4">
        <Box className={`rounded-xl p-3 ${isHospital ? 'bg-secondary-50' : 'bg-info-50'}`}>
          <Icon
            as={isHospital ? HospitalIcon : Building2Icon}
            className={isHospital ? 'text-secondary-600' : 'text-info-600'}
            style={{ width: 24, height: 24 }}
          />
        </Box>

        <VStack space="xs" className="flex-1">
          <Text bold numberOfLines={1} className="text-typography-900">
            {orgName ?? formTitle}
          </Text>
          <HStack space="sm" className="items-center">
            <Box
              className={`rounded-full px-2 py-0.5 ${isHospital ? 'bg-secondary-100' : 'bg-info-100'}`}
            >
              <Text
                size="xs"
                className={`font-JakartaSemiBold ${isHospital ? 'text-secondary-700' : 'text-info-700'}`}
              >
                {isHospital ? 'Hospital' : 'Milk Bank'}
              </Text>
            </Box>
            {totalQuestions !== undefined && (
              <Text size="xs" className="text-typography-500">
                {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
              </Text>
            )}
          </HStack>
        </VStack>

        <Icon as={ChevronRightIcon} className="shrink-0 text-typography-400" />
      </HStack>
    </AnimatedPressable>
  );
}

function EmptyState() {
  return (
    <VStack space="sm" className="flex-1 items-center justify-center py-16">
      <Box className="rounded-full bg-background-100 p-5">
        <Icon as={BuildingIcon} className="text-typography-400" style={{ width: 40, height: 40 }} />
      </Box>
      <Heading size="md" className="text-center text-typography-600">
        No organizations found
      </Heading>
      <Text size="sm" className="text-center text-typography-400">
        No hospitals or milk banks have published a screening form yet.
      </Text>
    </VStack>
  );
}

function countVisibleFields(fields: DonorScreeningFormField[] | null | undefined): number {
  return fields?.filter((f) => 'hidden' in f && f.hidden !== true).length ?? 0;
}
