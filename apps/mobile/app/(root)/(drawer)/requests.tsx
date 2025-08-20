import SafeArea from '@/components/SafeArea';
import { AvailableRequestsTab } from '@/components/tabs/AvailableRequestsTab';

export default function RequestsPage() {
  return (
    <SafeArea safeTop={false}>
      <AvailableRequestsTab />
    </SafeArea>
  );
}
