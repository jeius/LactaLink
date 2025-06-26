import SafeArea from '@/components/SafeArea';
import { Text } from '@/components/ui/text';
import { DonationRequestSlug } from '@/lib/types/donationRequest';
import { capitalizeFirst } from '@lactalink/utilities';
import { useLocalSearchParams } from 'expo-router';

export default function ListPage() {
  const { slug } = useLocalSearchParams<{ slug: DonationRequestSlug }>();
  const capitalizedSlug = slug && capitalizeFirst(slug);

  return (
    <SafeArea>
      <Text>{capitalizedSlug} Page</Text>
    </SafeArea>
  );
}
