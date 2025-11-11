import { useHeaderSize } from '@/components/contexts/HeaderProvider';
import { DrawerHeader } from '@/components/drawer/DrawerHeader';
import { OrganizationList } from '@/components/lists/OrganizationList';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import React from 'react';

export default function MilkBankListsPage() {
  const { height: headerHeight } = useHeaderSize();
  return (
    <SafeArea safeTop={false} className="items-stretch">
      <DrawerHeader title="Milk Banks" hideShadow />

      {/* Spacer to offset for the header */}
      <Box className="w-0" style={{ height: headerHeight }} />

      <OrganizationList collection="milkBanks" />
    </SafeArea>
  );
}
