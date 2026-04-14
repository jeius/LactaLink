import SafeArea from '@/components/SafeArea';
import ScrollView from '@/components/ui/ScrollView';
import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useStandardScreeningFormQuery } from '@/features/donor-screening/hooks/queries';
import { useErrorBoundary } from '@/hooks/useErrorBoundary';
import { Link, Stack } from 'expo-router';
import { BuildingIcon, ChevronRightIcon, HospitalIcon, StethoscopeIcon } from 'lucide-react-native';

export default function EntryScreen() {
  const { data: standardForm, isLoading, error } = useStandardScreeningFormQuery();

  useErrorBoundary(error);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeArea safeTop className="items-stretch">
        <ScrollView contentContainerClassName="p-6 gap-8">
          {/* Hero */}
          <VStack space="sm" className="items-center pt-4">
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

            {/* Standard Screening CTA */}
            {isLoading ? (
              <Skeleton variant="rounded" className="h-24 w-full" />
            ) : (
              <Link asChild push href={`/donor-screening/form/${standardForm?.id}`}>
                <Button
                  variant="outline"
                  action="default"
                  className="h-auto flex-row items-center justify-between rounded-2xl border-outline-200 bg-background-0 p-4"
                  isDisabled={!standardForm}
                >
                  <HStack space="md" className="flex-1 items-center">
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
                </Button>
              </Link>
            )}

            {/* Find Organizations CTA */}
            <Link asChild push href="/donor-screening/organizations">
              <Button
                variant="outline"
                action="default"
                className="h-auto flex-row items-center justify-between rounded-2xl border-outline-200 bg-background-0 p-4"
              >
                <HStack space="md" className="flex-1 items-center">
                  <Box className="rounded-xl bg-secondary-50 p-3">
                    <Icon
                      as={BuildingIcon}
                      className="text-secondary-600"
                      style={{ width: 24, height: 24 }}
                    />
                  </Box>
                  <VStack space="xs" className="flex-1">
                    <Text bold className="text-typography-900">
                      Find Organizations
                    </Text>
                    <Text size="sm" className="text-typography-500">
                      Browse hospitals and milk banks with custom forms.
                    </Text>
                  </VStack>
                  <Icon as={ChevronRightIcon} className="shrink-0 text-typography-400" />
                </HStack>
              </Button>
            </Link>
          </VStack>

          {/* Footer note */}
          <HStack space="sm" className="items-start rounded-2xl bg-background-50 p-4">
            <Icon as={HospitalIcon} className="mt-0.5 shrink-0 text-info-500" size="sm" />
            <Text size="sm" className="flex-1 text-typography-500">
              Already screened by a hospital or milk bank? Look them up above to use their custom
              screening form.
            </Text>
          </HStack>
        </ScrollView>
      </SafeArea>
    </>
  );
}
