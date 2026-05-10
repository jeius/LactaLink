import { useMeUser } from '@/hooks/auth/useAuth';
import { extractID } from '@lactalink/utilities/extractors';
import { Redirect } from 'expo-router';

export default function ProfilePage() {
  const { data: user } = useMeUser();

  const profileID = extractID(user?.profile?.value) || null;
  const profileSlug = user?.profile?.relationTo || null;

  if (!profileID || !profileSlug) {
    return <Redirect href="/profile/setup" />;
  }

  return <Redirect href={`/profile/${profileSlug}/${profileID}`} />;
}
