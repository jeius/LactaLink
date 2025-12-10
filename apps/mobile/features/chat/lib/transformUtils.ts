import { BLUR_HASH } from '@/lib/constants';
import { getMeUser } from '@/lib/stores/meUserStore';
import { InfiniteDataMap } from '@/lib/types';
import { createTempID, isTempID } from '@/lib/utils/tempID';
import { transformToImageSchema } from '@/lib/utils/transformData';
import { MESSAGE_TYPE } from '@lactalink/enums';
import { ImageData } from '@lactalink/types';
import { Conversation, Message, MessageMedia } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import {
  extractCollection,
  extractDisplayName,
  extractID,
  extractName,
} from '@lactalink/utilities/extractors';
import { ChatMessage } from './types';

export function transformToChatMessage(msg: Message): ChatMessage {
  const senderDoc = extractCollection(msg.sender.value);
  const displayName = extractDisplayName({ profile: msg.sender });
  const avatar = extractCollection(senderDoc?.avatar);
  const attachments = extractCollection(msg.attachments?.docs) ?? undefined;

  const media = attachments
    ?.filter((att) => att.attachment.relationTo === 'message-media')
    .map((att) => extractCollection(att.attachment.value))
    .filter(Boolean) as MessageMedia[];

  const image = media?.[0]?.url || undefined;

  const replyTo = extractCollection(msg.replyTo);
  const replyToAttachment = extractCollection(replyTo?.attachments?.docs?.[0]);
  const replyToMedia = replyToAttachment
    ? replyToAttachment.attachment.relationTo === 'message-media'
      ? extractCollection(replyToAttachment.attachment.value)
      : null
    : null;

  const replyToImageData: ImageData | null = replyToMedia && {
    uri: replyToMedia.url ?? null,
    alt: replyToMedia.alt || '',
    blurHash: replyToMedia.blurHash || BLUR_HASH,
  };

  return {
    _id: msg.id,
    text: msg.content ?? '',
    conversation: msg.conversation,
    sender: msg.sender,
    createdAt: new Date(msg.createdAt),
    system: msg.type === MESSAGE_TYPE.SYSTEM.value,
    pending: isTempID(msg.id),
    sent: !isTempID(msg.id),
    image: image,
    media: media?.map((m) => transformToImageSchema(m)),
    editedAt: msg.editedAt,
    deletedAt: msg.deletedAt,
    user: {
      _id: extractID(senderDoc?.owner) || displayName,
      name: displayName,
      avatar: avatar?.sizes?.thumbnail?.url || undefined,
    },
    replyTo: replyTo && {
      _id: replyTo.id,
      text: replyTo.content || '',
      media: replyToImageData,
    },
  };
}

export function transformToMessage(
  chatMessage: ChatMessage,
  prevMessages?: InfiniteDataMap<Message>
): Message {
  const meUser = getMeUser();
  const now = new Date().toISOString();

  let replyTo: Message | undefined = undefined;
  if (chatMessage.replyTo) {
    // Try to find the full replyTo message in previous messages cache
    for (const page of prevMessages?.pages || []) {
      const foundMsg = page.docs.get(chatMessage.replyTo._id as string);
      if (foundMsg) {
        replyTo = foundMsg;
        break;
      }
    }
  }

  return {
    id: chatMessage._id as string,
    content: chatMessage.text,
    createdAt: new Date(chatMessage.createdAt).toISOString(),
    conversation: chatMessage.conversation,
    sender: chatMessage.sender,
    type: MESSAGE_TYPE.TEXT.value,
    updatedAt: chatMessage.editedAt || new Date(chatMessage.createdAt).toISOString(),
    edited: !!chatMessage.editedAt,
    editedAt: chatMessage.editedAt,
    deletedAt: chatMessage.deletedAt,
    searchVector: chatMessage.text,
    replyTo: replyTo,
    attachments: {
      docs: chatMessage.media?.map((media) => ({
        id: createTempID(),
        createdAt: now,
        updatedAt: now,
        message: chatMessage._id as string,
        createdBy: meUser?.id!,
        attachment: {
          relationTo: 'message-media',
          value: {
            id: createTempID(),
            url: media.url,
            createdAt: now,
            updatedAt: now,
            alt: media.alt || '',
            sizes: { thumbnail: { url: media.url }, preview: { url: media.url } },
          },
        },
      })),
      totalDocs: chatMessage.media?.length || 0,
      hasNextPage: false,
    },
  };
}

export function extractLastMessage(conversation: Conversation) {
  const meUser = getMeUser();

  const lastMessage = conversation.messages?.docs?.[0] ?? null;
  const lastMsgDoc = extractCollection(lastMessage);

  const name = extractName({ profile: lastMsgDoc?.sender });
  const content = lastMsgDoc?.content;

  const isMyMsg = isEqualProfiles(lastMsgDoc?.sender, meUser?.profile);
  const isSystemMsg = lastMsgDoc?.type === MESSAGE_TYPE.SYSTEM.value;

  const hasAttachment = (lastMsgDoc?.attachments?.docs?.length ?? 0) > 0;
  const unread = (lastMsgDoc?.reads?.docs?.length ?? 0) < 1 && !isMyMsg;

  const lastMessageText =
    lastMsgDoc &&
    (hasAttachment
      ? isMyMsg
        ? 'You sent an image'
        : content
          ? content
          : `${name} sent an image`
      : isMyMsg
        ? isSystemMsg
          ? content
          : `You: ${content}` || 'You sent a message'
        : content);

  return { text: lastMessageText, lastMessage: lastMsgDoc, unread };
}
