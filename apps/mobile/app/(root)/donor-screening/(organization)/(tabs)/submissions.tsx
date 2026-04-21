import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { FlashList } from '@/components/ui/FlashList';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useRouter } from 'expo-router';
import { ChevronRightIcon, InboxIcon, UserIcon } from 'lucide-react-native';

type PlaceholderSubmission = {
  id: string;
  donorName: string;
  donorEmail: string;
  /** `'published'` = submitted, `'draft'` = in-progress. */
  status: 'draft' | 'published';
  submittedAt: string;
};

const PLACEHOLDER_DATA: PlaceholderSubmission[] = [
  {
    id: '1',
    donorName: 'Maria Santos',
    donorEmail: 'maria.santos@example.com',
    status: 'published',
    submittedAt: '2026-04-15T10:30:00Z',
  },
  {
    id: '2',
    donorName: 'Ana Reyes',
    donorEmail: 'ana.reyes@example.com',
    status: 'draft',
    submittedAt: '2026-04-14T08:15:00Z',
  },
  {
    id: '3',
    donorName: 'Grace Villanueva',
    donorEmail: 'grace.v@example.com',
    status: 'published',
    submittedAt: '2026-04-13T14:00:00Z',
  },
  {
    id: '4',
    donorName: 'Lea Magbanua',
    donorEmail: 'lea.m@example.com',
    status: 'draft',
    submittedAt: '2026-04-12T09:45:00Z',
  },
  {
    id: '5',
    donorName: 'Sofia Cruz',
    donorEmail: 'sofia.cruz@example.com',
    status: 'published',
    submittedAt: '2026-04-10T16:20:00Z',
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function SubmissionItem({ item }: { item: PlaceholderSubmission }) {
  const router = useRouter();
  const isSubmitted = item.status === 'published';

  return (
    // TODO: Replace router.push path with actual submission detail route once implemented
    <Pressable onPress={() => router.push('/')} className="px-4 py-2 active:opacity-70">
      <HStack
        space="md"
        className="items-center rounded-2xl border border-outline-100 bg-background-0 p-4"
      >
        <Box className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background-100">
          <Icon as={UserIcon} size="xl" className="text-typography-400" />
        </Box>

        <VStack space="xs" className="flex-1">
          <Text bold numberOfLines={1} className="text-typography-900">
            {item.donorName}
          </Text>
          <Text size="sm" numberOfLines={1} className="text-typography-500">
            {item.donorEmail}
          </Text>
          <HStack space="sm" className="items-center">
            <Badge size="sm" action={isSubmitted ? 'success' : 'warning'} variant="solid">
              <BadgeText>{isSubmitted ? 'Submitted' : 'Draft'}</BadgeText>
            </Badge>
            <Text size="xs" className="text-typography-400">
              {formatDate(item.submittedAt)}
            </Text>
          </HStack>
        </VStack>

        <Icon as={ChevronRightIcon} size="sm" className="shrink-0 text-typography-400" />
      </HStack>
    </Pressable>
  );
}

function ListHeader() {
  return (
    <HStack className="items-center justify-between px-4 pb-2 pt-4">
      <Heading size="md">All Submissions</Heading>
      <Badge size="md" variant="solid" action="muted">
        <BadgeText>{PLACEHOLDER_DATA.length}</BadgeText>
      </Badge>
    </HStack>
  );
}

function ListEmpty() {
  return (
    <VStack space="md" className="flex-1 items-center justify-center py-16">
      <Box className="rounded-full bg-background-100 p-6">
        <Icon as={InboxIcon} size="xl" className="text-typography-400" />
      </Box>
      <VStack space="xs" className="items-center">
        <Heading size="md" className="text-typography-700">
          No submissions yet
        </Heading>
        <Text size="sm" className="text-center text-typography-500">
          Submitted screening forms from donors will appear here.
        </Text>
      </VStack>
    </VStack>
  );
}

export default function SubmissionsTab() {
  return (
    <FlashList
      data={PLACEHOLDER_DATA}
      renderItem={({ item }) => <SubmissionItem item={item} />}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 24 }}
      ListHeaderComponent={<ListHeader />}
      ListEmptyComponent={<ListEmpty />}
    />
  );
}
