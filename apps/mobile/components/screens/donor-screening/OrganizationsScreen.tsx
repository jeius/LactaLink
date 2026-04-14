import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { FlashList } from '@/components/ui/FlashList';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useInfiniteScreeningForms } from '@/features/donor-screening/hooks/queries';
import { useErrorBoundary } from '@/hooks/useErrorBoundary';
import { DonorScreeningForm } from '@lactalink/types/payload-generated-types';
import { useRouter } from 'expo-router';
import { BuildingIcon, ChevronRightIcon, LandmarkIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';

function OrgFormCardSkeleton() {
  return (
    <HStack space="md" className="items-center rounded-2xl bg-background-0 p-4">
      <Skeleton variant="rounded" className="h-12 w-12 shrink-0" />
      <VStack space="xs" className="flex-1">
        <Skeleton variant="rounded" className="h-4 w-3/5" />
        <Skeleton variant="rounded" className="h-3 w-2/5" />
      </VStack>
    </HStack>
  );
}

function OrgFormCard({ form }: { form: DonorScreeningForm }) {
  const router = useRouter();

  const org = form.organization;
  const isHospital = org?.relationTo === 'hospitals';
  const orgValue = org?.value;
  const orgName =
    typeof orgValue !== 'string' ? (orgValue?.displayName ?? orgValue?.name) : undefined;
  const formTitle = form.title;
  const sectionCount = form.sections && form.sections.length > 0 ? form.sections.length : undefined;

  return (
    <Pressable
      onPress={() => router.push(`/donor-screening/form/${form.id}`)}
      className="active:opacity-70"
    >
      <HStack
        space="md"
        className="items-center rounded-2xl border border-outline-100 bg-background-0 p-4"
      >
        <Box className={`rounded-xl p-3 ${isHospital ? 'bg-info-50' : 'bg-tertiary-50'}`}>
          <Icon
            as={isHospital ? LandmarkIcon : BuildingIcon}
            className={isHospital ? 'text-info-600' : 'text-tertiary-600'}
            style={{ width: 24, height: 24 }}
          />
        </Box>

        <VStack space="xs" className="flex-1">
          <Text bold numberOfLines={1} className="text-typography-900">
            {orgName ?? formTitle}
          </Text>
          <HStack space="sm" className="items-center">
            <Box
              className={`rounded-full px-2 py-0.5 ${isHospital ? 'bg-info-100' : 'bg-tertiary-100'}`}
            >
              <Text size="xs" bold className={isHospital ? 'text-info-700' : 'text-tertiary-700'}>
                {isHospital ? 'Hospital' : 'Milk Bank'}
              </Text>
            </Box>
            {sectionCount !== undefined && (
              <Text size="xs" className="text-typography-500">
                {sectionCount} section{sectionCount !== 1 ? 's' : ''}
              </Text>
            )}
          </HStack>
        </VStack>

        <Icon as={ChevronRightIcon} className="shrink-0 text-typography-400" />
      </HStack>
    </Pressable>
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

export default function OrganizationsScreen() {
  const {
    data: forms,
    isLoading,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteScreeningForms();

  useErrorBoundary(error);

  const orgForms = forms.filter((form) => form.organization != null);

  if (isLoading) {
    return (
      <SafeArea safeTop={false} className="items-stretch justify-start">
        <VStack space="sm" className="p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <OrgFormCardSkeleton key={i} />
          ))}
        </VStack>
      </SafeArea>
    );
  }

  return (
    <SafeArea safeTop={false} className="items-stretch justify-start">
      <FlashList
        data={orgForms}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4 grow"
        ItemSeparatorComponent={() => <Box className="h-3" />}
        refreshing={isRefetching}
        onRefresh={refetch}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item }) => <OrgFormCard form={item} />}
      />
    </SafeArea>
  );
}
