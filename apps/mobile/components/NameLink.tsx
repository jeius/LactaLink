import { User } from '@lactalink/types/payload-generated-types';
import { UserProfile } from '@lactalink/types';
import { useProfileData } from '@/features/profile/hooks/useProfileData';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { Link } from 'expo-router';
import { Text, TextProps } from './ui/text';

export default function NameLink({
  value,
  relationTo,
  bold = true,
  numberOfLines = 1,
  ...props
}: NonNullable<User['profile']> & TextProps) {
  const id = extractID(value);
  const doc = extractCollection(value);
  const { data: populatedProfile } = useProfileData({ relationTo, value } as UserProfile);
  const resolvedDoc = populatedProfile?.value || doc;
  const name =
    resolvedDoc?.displayName ||
    (resolvedDoc && 'name' in resolvedDoc ? resolvedDoc.name : null) ||
    (resolvedDoc && 'givenName' in resolvedDoc ? resolvedDoc.givenName : null) ||
    'Unknown User';

  return (
    <Link asChild push href={`/profile/${relationTo}/${id}`}>
      <Text {...props} bold={bold} numberOfLines={numberOfLines}>
        {name}
      </Text>
    </Link>
  );
}
