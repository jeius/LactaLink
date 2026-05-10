import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { Box } from '@/components/ui/box';
import ProfileEditForm from '@/features/profile/components/edit';
import { useProfileData } from '@/features/profile/hooks/useProfileData';
import { useMeUser } from '@/hooks/auth/useAuth';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { extractID } from '@lactalink/utilities/extractors';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ProfileSlug = Extract<CollectionSlug, 'hospitals' | 'milkBanks' | 'individuals'>;

export default function ProfileEditPage() {
  const insets = useSafeAreaInsets();
  const { id, slug } = useLocalSearchParams<{ slug: ProfileSlug; id: string }>();

  const { data: user } = useMeUser();
  const isMeUser = extractID(user?.profile?.value) === id;

  const { data, ...profileQuery } = useProfileData(
    isMeUser ? user?.profile! : { relationTo: slug, value: id }
  );

  const isLoading = profileQuery.isLoading;

  if (isLoading || !data) {
    return <LoadingSpinner />;
  }

  return (
    <Box
      style={{ paddingBottom: insets.bottom }}
      className="flex-1 border border-outline-200 bg-background-50"
    >
      <ProfileEditForm profile={data} />
    </Box>
  );
}
