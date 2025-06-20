import { useFetchById } from '@/hooks/collections/useFetchById';
import { CollectionSlug } from '@lactalink/types';
import { capitalizeFirst } from '@lactalink/utilities';
import React from 'react';
import { Card } from '../ui/card';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

interface InfoCardProps {
  id: string;
  slug: Extract<CollectionSlug, 'donations' | 'requests' | 'hospitals' | 'milkBanks'>;
}

export default function InfoCard({ id, slug }: InfoCardProps) {
  const { data } = useFetchById(true, { id, collection: slug });
  return (
    <Card className="m-4">
      <VStack className="items-center justify-center">
        <Text>Details of selected {capitalizeFirst(slug)} here.</Text>
      </VStack>
    </Card>
  );
}
