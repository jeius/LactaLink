import { User } from '@lactalink/types/payload-generated-types';
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
  const name = doc?.displayName || 'Unknown User';

  return (
    <Link asChild push href={`/profile/${relationTo}/${id}`}>
      <Text {...props} bold={bold} numberOfLines={numberOfLines}>
        {name}
      </Text>
    </Link>
  );
}
