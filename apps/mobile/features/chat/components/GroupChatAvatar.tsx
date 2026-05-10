import Avatar from '@/components/Avatar';
import { Image } from '@/components/Image';
import { Box } from '@/components/ui/box';
import { BLUR_HASH } from '@/lib/constants';
import { UserProfile } from '@lactalink/types';
import { Conversation } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';

export default function GroupChatAvatar({
  avatar,
  participants,
}: {
  avatar: Conversation['avatar'];
  participants: UserProfile[];
}) {
  const avatarDoc = extractCollection(avatar);
  if (avatarDoc && avatarDoc.url) {
    return (
      <Image
        source={{ uri: avatarDoc.url }}
        placeholder={{ blurhash: avatarDoc.blurHash ?? BLUR_HASH }}
        className="h-12 w-12 overflow-hidden rounded-full"
      />
    );
  }

  return (
    <Box className="h-12 w-12">
      {participants.slice(0, 2).map((profile, index) => {
        return (
          <Box
            key={extractID(profile.value)}
            className="absolute"
            style={{
              top: index * 15,
              left: index * 15,
            }}
          >
            <Avatar profile={profile} size="xs" />
          </Box>
        );
      })}
    </Box>
  );
}
