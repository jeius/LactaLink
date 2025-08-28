import { OrganizationList } from '@/components/lists/OrganizationList';
import SafeArea from '@/components/SafeArea';
import React from 'react';

export default function HospitalListsPage() {
  return (
    <SafeArea safeTop={false} className="items-stretch">
      <OrganizationList collection="hospitals" />
    </SafeArea>
  );
}
