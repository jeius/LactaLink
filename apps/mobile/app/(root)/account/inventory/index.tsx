import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useProfileData } from '@/features/profile/hooks/useProfileData';
import { useMeUser } from '@/hooks/auth/useAuth';
import { Href, Link } from 'expo-router';
import {
  AlarmClockIcon,
  ChevronRightIcon,
  DropletIcon,
  HeartIcon,
  MilkIcon,
  PackageOpenIcon,
  Trash2Icon,
} from 'lucide-react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function InventoryPage() {
  const { data: user } = useMeUser();
  const { data: profile } = useProfileData(user?.profile);
  const organization = profile?.relationTo !== 'individuals' ? profile?.value : null;
  const available = organization && 'totalVolume' in organization ? organization.totalVolume || 0 : 0;
  const receivedCount =
    organization && 'receivedTransactions' in organization
      ? organization.receivedTransactions?.totalDocs || 0
      : 0;

  return (
    <SafeArea safeTop={false} className="items-stretch bg-primary-50">
      <ScrollView className="flex-1" contentContainerClassName="grow px-4 py-5">
        <VStack space="lg" className="w-full max-w-screen-md self-center">
          <HStack space="md" className="items-stretch">
            <FeaturedStat
              title="Available"
              value={available}
              icon={MilkIcon}
              footer="▲ Current stock"
              footerClassName="text-success-700"
            />
            <FeaturedStat
              title="Expiring Soon"
              value={0}
              icon={AlarmClockIcon}
              footer="in the next 3 days"
              footerClassName="text-typography-600"
            />
          </HStack>

          <HStack space="md" className="items-center">
            <Divider className="flex-1 bg-primary-100" />
            <Text size="xs" className="text-typography-600">Updated from live inventory</Text>
          </HStack>

          <VStack space="md">
            <HStack space="md">
              <InventoryLink title="Consumed" value={0} icon={DropletIcon} href="/account/inventory/consumed" />
              <InventoryLink title="Expired" value={0} icon={Trash2Icon} href="/account/inventory/expired" />
            </HStack>
            <HStack space="md">
              <InventoryLink title="Donated" value={0} icon={HeartIcon} href="/account/inventory/donated" />
              <InventoryLink title="Received" value={receivedCount} icon={PackageOpenIcon} href="/account/inventory/received" unit="transactions" />
            </HStack>
          </VStack>
        </VStack>
      </ScrollView>
    </SafeArea>
  );
}

function FeaturedStat({ title, value, icon, footer, footerClassName }: { title: string; value: number; icon: typeof MilkIcon; footer: string; footerClassName: string }) {
  return (
    <Card className="min-h-40 flex-1 rounded-3xl border border-primary-100 bg-background-0 p-5">
      <HStack className="items-center justify-between">
        <HStack space="sm" className="items-center"><Box className="h-12 w-12 items-center justify-center rounded-full bg-primary-50"><Icon as={icon} size="lg" className="text-primary-500" /></Box><Text bold className="text-primary-900">{title}</Text></HStack>
        <Icon as={icon} size="xl" className="text-primary-300" />
      </HStack>
      <Text size="3xl" bold className="mt-4 text-primary-950">{value.toLocaleString()} mL</Text>
      <Text size="sm" bold className={`mt-1 ${footerClassName}`}>{footer}</Text>
    </Card>
  );
}

function InventoryLink({ title, value, icon, href, unit = 'mL' }: { title: string; value: number; icon: typeof MilkIcon; href: Href; unit?: string }) {
  return (
    <Link href={href} asChild>
      <Pressable className="flex-1 overflow-hidden rounded-2xl border border-primary-100 bg-background-0 p-4">
        <HStack space="md" className="items-center">
          <Box className="h-12 w-12 items-center justify-center rounded-full bg-primary-50"><Icon as={icon} className="text-primary-500" /></Box>
          <VStack className="min-w-0 flex-1"><Text size="sm" className="text-typography-600">{title}</Text><Text size="xl" bold className="text-primary-950">{value.toLocaleString()} {unit}</Text></VStack>
          <Box className="h-10 w-10 items-center justify-center rounded-full bg-primary-50"><Icon as={ChevronRightIcon} className="text-primary-500" /></Box>
        </HStack>
      </Pressable>
    </Link>
  );
}
