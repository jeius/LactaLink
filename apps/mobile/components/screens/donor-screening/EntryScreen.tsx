import { HeaderBackButton } from '@/components/HeaderBackButton';
import SafeArea from '@/components/SafeArea';
import { AnimatedPressable } from '@/components/animated/pressable';
import ScrollView from '@/components/ui/ScrollView';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  useMySubmissionsInfQuery,
  useStandardScreeningFormQuery,
} from '@/features/donor-screening/hooks/queries';
import { SubmissionCreateSearchParams } from '@/features/donor-screening/lib/types';
import { useErrorBoundary } from '@/hooks/useErrorBoundary';
import { Link } from 'expo-router';
import {
  ChevronRightIcon,
  HospitalIcon,
  ScrollTextIcon,
  StethoscopeIcon,
} from 'lucide-react-native';

export default function EntryScreen() {
  const { data: standardForm, isLoading, error } = useStandardScreeningFormQuery();
  const { data: mySubmissions } = useMySubmissionsInfQuery();
  const hasSubmissions = mySubmissions.length > 0;

  useErrorBoundary(error);

  return (
    <SafeArea className="items-stretch">
      <HStack className="px-2">
        <HeaderBackButton />
      </HStack>
      <ScrollView contentContainerClassName="p-5 gap-8">
        {/* Hero */}
        <VStack space="sm" className="items-center">
          <Box className="rounded-full bg-primary-100 p-5">
            <Icon
              as={StethoscopeIcon}
              style={{ width: 56, height: 56 }}
              className="stroke-primary-600"
            />
          </Box>
          <Heading size="2xl" className="mt-2 text-center">
            Donor Screening
          </Heading>
          <Text size="md" className="text-center text-typography-500">
            Complete a health screening to begin your breastmilk donation journey.
          </Text>
        </VStack>

        <Divider />

        {/* CTA cards */}
        <VStack space="md">
          <Text bold size="sm" className="uppercase tracking-widest text-typography-400">
            Choose how to proceed
          </Text>

          {hasSubmissions && (
            <Link asChild push href="/donor-screening/submissions">
              <AnimatedPressable
                disabled={!standardForm}
                className="overflow-hidden rounded-2xl border border-outline-200 bg-background-0"
              >
                <HStack space="md" className="items-center p-4">
                  <Box className="rounded-xl bg-warning-50 p-3">
                    <Icon
                      as={ScrollTextIcon}
                      className="text-warning-600"
                      style={{ width: 24, height: 24 }}
                    />
                  </Box>
                  <VStack space="xs" className="flex-1">
                    <Text bold className="text-typography-900">
                      My Submissions
                    </Text>
                    <Text size="sm" className="text-typography-500">
                      View and manage your past and current submissions.
                    </Text>
                  </VStack>
                  <Icon as={ChevronRightIcon} className="shrink-0 text-typography-400" />
                </HStack>
              </AnimatedPressable>
            </Link>
          )}

          {/* Standard Screening CTA */}
          {isLoading ? (
            <Skeleton variant="rounded" className="h-24 w-full" />
          ) : (
            <Link
              asChild
              push
              href={{
                pathname: `/donor-screening/submission/create`,
                params: { formID: standardForm?.id } satisfies SubmissionCreateSearchParams,
              }}
            >
              <AnimatedPressable
                disabled={!standardForm}
                className="overflow-hidden rounded-2xl border border-outline-200 bg-background-0"
              >
                <HStack space="md" className="items-center p-4">
                  <Box className="rounded-xl bg-primary-50 p-3">
                    <Icon
                      as={StethoscopeIcon}
                      className="stroke-primary-600"
                      style={{ width: 24, height: 24 }}
                    />
                  </Box>
                  <VStack space="xs" className="flex-1">
                    <Text bold className="text-typography-900">
                      Standard Screening
                    </Text>
                    <Text size="sm" className="text-typography-500">
                      General form for all individual donors.
                    </Text>
                  </VStack>
                  <Icon as={ChevronRightIcon} className="shrink-0 text-typography-400" />
                </HStack>
              </AnimatedPressable>
            </Link>
          )}

          {/* Find Organizations CTA */}
          <Link asChild push href="/donor-screening/organizations">
            <AnimatedPressable
              disabled={!standardForm}
              className="overflow-hidden rounded-2xl border border-outline-200 bg-background-0"
            >
              <HStack space="md" className="items-center p-4">
                <Box className="rounded-xl bg-secondary-50 p-3">
                  <Icon
                    as={HospitalIcon}
                    className="text-secondary-600"
                    style={{ width: 24, height: 24 }}
                  />
                </Box>
                <VStack space="xs" className="flex-1">
                  <Text bold className="text-typography-900">
                    Organization Screening
                  </Text>
                  <Text size="sm" className="text-typography-500">
                    Browse hospitals and milk banks with their own screening forms.
                  </Text>
                </VStack>
                <Icon as={ChevronRightIcon} className="shrink-0 text-typography-400" />
              </HStack>
            </AnimatedPressable>
          </Link>
        </VStack>

        {/* Footer note */}
        <HStack space="sm" className="items-start rounded-2xl bg-background-100 p-4">
          <Icon as={HospitalIcon} className="mt-0.5 shrink-0 text-secondary-500" size="sm" />
          <Text size="sm" className="flex-1 text-typography-600">
            Already screened by a hospital or milk bank? Look them up above to use their screening
            form.
          </Text>
        </HStack>
      </ScrollView>
    </SafeArea>
  );
}
