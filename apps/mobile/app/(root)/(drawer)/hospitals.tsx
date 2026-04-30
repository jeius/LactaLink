import { useHeaderSize } from '@/components/contexts/HeaderProvider';
import { DrawerHeader } from '@/components/drawer/DrawerHeader';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { OrganizationList } from '@/features/organizations/components/OrganizationList';

export default function HospitalListsPage() {
  const { height: headerHeight } = useHeaderSize();
  return (
    <SafeArea safeTop={false} className="items-stretch">
      <DrawerHeader title="Hospitals" hideShadow />

      {/* Spacer to offset for the header */}
      <Box className="w-0" style={{ height: headerHeight }} />

      <OrganizationList collection="hospitals" />
    </SafeArea>
  );
}
