import { CollectionSlug, Donation, Hospital, MilkBank, Request } from '@lactalink/types';
import React from 'react';
import { DonationInfoCard } from './DonationInfoCard';

interface InfoCardProps {
  data: Donation | Request | Hospital | MilkBank | { id: string };
  slug: Extract<CollectionSlug, 'donations' | 'requests' | 'hospitals' | 'milkBanks'>;
}

export default function InfoCard({ data, slug }: InfoCardProps) {
  if (slug === 'donations') {
    return <DonationInfoCard data={data as Donation} />;
  }
  return null;
}
