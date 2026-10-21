import { Image } from '@/components/Image';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useProfileData } from '@/features/profile/hooks/useProfileData';
import { useMeUser } from '@/hooks/auth/useAuth';
import { formatNumberToShortenUnits } from '@lactalink/utilities/formatters';
import { Link } from 'expo-router';
import {
  Building2Icon,
  ClipboardListIcon,
  HandHeartIcon,
  MapPinnedIcon,
  MilkIcon,
  PackageOpenIcon,
  TruckIcon,
} from 'lucide-react-native';

export default function HomeDashboard() {
  const { data: user } = useMeUser();
  const { data: profile } = useProfileData(user?.profile);
  const doc = profile?.value;
  const organization = profile?.relationTo !== 'individuals' ? doc : null;
  const isOrganization = profile?.relationTo === 'hospitals' || profile?.relationTo === 'milkBanks';
  const stock = organization && 'totalVolume' in organization ? organization.totalVolume || 0 : 0;
  const incoming =
    organization && 'receivedTransactions' in organization
      ? organization.receivedTransactions?.totalDocs || 0
      : 0;

  return (
    <VStack space="md" className="px-4 pt-3">
      <Box className="h-56 overflow-hidden rounded-3xl border border-primary-100 bg-primary-50">
        <VStack className="z-10 h-full w-3/5 justify-center p-6">
          <Text size="3xl" bold className="leading-tight text-primary-900">Share Milk{`\n`}Nurture Lives</Text>
          <Text size="sm" className="mt-2 text-primary-800">Together, we can give every baby a healthier tomorrow.</Text>
          {!isOrganization && <Link asChild push href="/donations/create"><Pressable className="mt-4 self-start rounded-full bg-primary-500 px-5 py-3"><Text bold className="text-primary-0">Donate Now</Text></Pressable></Link>}
        </VStack>
        <Image source={require('@/assets/images/1x/pumping_milk.png')} alt="Mother expressing breast milk" className="absolute bottom-0 right-0 h-52 w-48" contentFit="contain" />
      </Box>

      <HStack space="sm">
        {!isOrganization && <QuickAction href="/donations/create" label="Donate Milk" icon={MilkIcon} tone="bg-primary-50 text-primary-600" />}
        <QuickAction href="/requests/create" label="Request Milk" icon={HandHeartIcon} tone="bg-warning-50 text-warning-700" />
        <QuickAction href="/hospitals" label="Find Hospitals" icon={Building2Icon} tone="bg-info-50 text-info-700" />
        <QuickAction href="/milk-banks" label="Find Milk Banks" icon={MapPinnedIcon} tone="bg-success-50 text-success-700" />
      </HStack>

      <VStack space="sm" className="rounded-2xl border border-primary-100 bg-background-0 p-3">
        <HStack className="items-center justify-between"><Text bold className="text-primary-900">Supply Overview</Text><Link push href="/account/inventory"><Text size="sm" className="text-primary-600">View Details ›</Text></Link></HStack>
        <HStack space="sm">
          <SupplyStat icon={MilkIcon} value={`${formatNumberToShortenUnits(stock, 1)} mL`} label="Available Stock" tone="bg-primary-50 text-primary-600" />
          <SupplyStat icon={ClipboardListIcon} value={0} label="Pending Requests" tone="bg-warning-50 text-warning-700" />
          <SupplyStat icon={PackageOpenIcon} value={incoming} label="Incoming Donations" tone="bg-secondary-50 text-secondary-700" />
          <SupplyStat icon={TruckIcon} value={0} label="Deliveries Today" tone="bg-success-50 text-success-700" />
        </HStack>
      </VStack>

      <Text size="xl" bold className="pt-1 text-primary-900">Latest Requests & Community Posts</Text>
    </VStack>
  );
}

function QuickAction({ href, label, icon, tone }: { href: '/donations/create' | '/requests/create' | '/hospitals' | '/milk-banks'; label: string; icon: typeof MilkIcon; tone: string }) {
  const [background, color] = tone.split(' ');
  return <Link asChild push href={href}><Pressable className={`min-h-28 flex-1 items-center justify-center rounded-2xl p-2 ${background}`}><Icon as={icon} size="xl" className={color} /><Text size="xs" bold className="mt-2 text-center text-typography-800">{label}</Text></Pressable></Link>;
}

function SupplyStat({ icon, value, label, tone }: { icon: typeof MilkIcon; value: string | number; label: string; tone: string }) {
  const [background, color] = tone.split(' ');
  return <VStack className={`min-h-24 flex-1 items-center justify-center rounded-xl p-2 ${background}`}><Icon as={icon} className={color} /><Text size="lg" bold className="mt-1 text-typography-900">{value}</Text><Text size="2xs" className="text-center text-typography-600">{label}</Text></VStack>;
}
