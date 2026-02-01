import React from 'react';

import { Pressable } from '@/components/ui/pressable';
import DonationCard from '@/features/donation&request/components/cards/DonationCard';
import RequestCard from '@/features/donation&request/components/cards/RequestCard';
import { Post } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { Link } from 'expo-router';

export default function PostShare({ sharedFrom }: Pick<Post, 'sharedFrom'>) {
  if (!sharedFrom) return null;

  if (sharedFrom.relationTo === 'posts') return null; // Todo: render shared post preview

  const slug = sharedFrom.relationTo;
  const id = extractID(sharedFrom.value);

  return (
    <Link href={`/${slug}/${id}`} push asChild>
      <Pressable style={{ marginHorizontal: 12 }}>
        {sharedFrom.relationTo === 'donations' ? (
          <DonationCard data={sharedFrom.value} />
        ) : (
          <RequestCard data={sharedFrom.value} />
        )}
      </Pressable>
    </Link>
  );
}
