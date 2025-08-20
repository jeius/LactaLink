import SafeArea from '@/components/SafeArea';
import { AvailableDonationsTab } from '@/components/tabs/AvailableDonationsTab';

export default function DonationsPage() {
  return (
    <SafeArea safeTop={false}>
      <AvailableDonationsTab />
    </SafeArea>
  );
}
