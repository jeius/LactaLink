import { ProfileAvatar } from '@/components/Avatar';
import { Image } from '@/components/Image';
import { Box } from '@/components/ui/box';
import { BLUR_HASH } from '@/lib/constants';
import { Conversation, ConversationParticipant } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';

export default function GroupChatAvatar({
  avatar,
  participants,
  isLoading,
}: {
  avatar: Conversation['avatar'];
  participants: ConversationParticipant[];
  isLoading?: boolean;
}) {
  const avatarDoc = extractCollection(avatar);
  if (avatarDoc && avatarDoc.url) {
    return (
      <Image
        source={{ uri: avatarDoc.url }}
        placeholder={{ blurhash: avatarDoc.blurHash ?? BLUR_HASH }}
        style={{ width: 40, height: 40, borderRadius: 20 }}
      />
    );
  }

  return (
    <Box style={{ width: 40, height: 40 }}>
      {participants.slice(0, 2).map((p, index) => {
        const user = extractCollection(p.participant);
        if (!user) return null;
        return (
          <Box
            key={p.id}
            className="absolute"
            style={{
              top: index * 15,
              left: index * 15,
            }}
          >
            <ProfileAvatar profile={user.profile} size="xs" isLoading={isLoading} />
          </Box>
        );
      })}
    </Box>
  );
}
